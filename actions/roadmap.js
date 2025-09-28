"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Roadmap content directory path
const ROADMAP_CONTENT_PATH = path.join(process.cwd(), "roadmap-content");

/**
 * Save a generated or manually created roadmap into the database
 */
export async function saveRoadmap(title, content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const roadmap = await db.roadmap.upsert({
      where: { userId_title: { userId: user.id, title } },
      update: { content },
      create: { userId: user.id, title, content },
    });

    revalidatePath("/roadmaps");
    return roadmap;
  } catch (error) {
    console.error("Error saving roadmap:", error);
    throw new Error("Failed to save roadmap");
  }
}

/**
 * Retrieve all saved roadmaps for the authenticated user
 */
export async function getRoadmaps() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return [];

    return await db.roadmap.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return [];
  }
}

/**
 * Get all available roadmap categories from JSON files
 */
export async function getAvailableRoadmaps() {
  try {
    const roadmapFiles = fs.readdirSync(ROADMAP_CONTENT_PATH);
    const roadmaps = roadmapFiles
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const name = file.replace('.json', '');
        const displayName = name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return {
          id: name,
          name: displayName,
          filename: file
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return roadmaps;
  } catch (error) {
    console.error("Error reading roadmap files:", error);
    throw new Error("Failed to load available roadmaps");
  }
}

/**
 * Get roadmap content by ID (handles both epic roadmaps and saved AI roadmaps)
 */
export async function getRoadmapContent(roadmapId) {
  try {
    // First, try to get from saved roadmaps (AI-generated)
    const { userId } = await auth();
    if (userId) {
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

      if (user) {
        const savedRoadmap = await db.roadmap.findFirst({
          where: { 
            id: roadmapId,
            userId: user.id 
          },
        });

        if (savedRoadmap) {
          // This is a saved AI roadmap
          return {
            id: savedRoadmap.id,
            name: savedRoadmap.title,
            description: savedRoadmap.content?.description || '',
            estimatedDuration: savedRoadmap.content?.estimatedDuration || '8-12 weeks',
            difficulty: savedRoadmap.content?.difficulty || 'beginner',
            steps: savedRoadmap.content?.steps || [],
            type: 'saved'
          };
        }
      }
    }

    // If not found in saved roadmaps, try epic roadmaps (JSON files)
    const filePath = path.join(ROADMAP_CONTENT_PATH, `${roadmapId}.json`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Roadmap ${roadmapId} not found`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const roadmapData = JSON.parse(fileContent);
    
    // Convert the object structure to an array of steps
    const steps = Object.values(roadmapData).map((step, index) => ({
      id: Object.keys(roadmapData)[index],
      title: step.title,
      description: step.description,
      links: step.links || []
    }));

    return {
      id: roadmapId,
      name: roadmapId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      steps,
      type: 'epic'
    };
  } catch (error) {
    console.error("Error loading roadmap content:", error);
    throw new Error(`Failed to load roadmap: ${roadmapId}`);
  }
}

/**
 * Generate a personalized roadmap using AI based on user's industry and goals
 */
export async function generatePersonalizedRoadmap({ role, goal, duration, currentSkills = [] }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
  You are an expert career mentor. Generate a **personalized learning roadmap** for becoming a "${role}" in the ${user.industry} industry.
  
  User's Goal: ${goal}
  Duration: ${duration}
  Current Skills: ${currentSkills.join(', ') || 'None specified'}
  
  Industry Context: ${user.industryInsight ? JSON.stringify(user.industryInsight) : 'No industry insights available'}

  Requirements:
  - Structure it in clear **phases** (e.g., Beginner, Intermediate, Advanced).
  - Include key **topics**, **tools**, and **skills** for each phase.
  - Mention estimated time for each step.
  - Consider the user's industry and current skill level.
  - Format the response as **JSON** with this structure:

  {
    "title": "Personalized Roadmap Title",
    "phases": [
      {
        "phase": "Phase Name",
        "duration": "e.g. 2 weeks",
        "topics": ["Topic 1", "Topic 2", ...],
        "resources": [
          {"title": "Resource Name", "type": "Course/Book/Video", "url": "https://..."}
        ]
      }
    ]
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    // Attempt to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (jsonErr) {
      console.warn("AI response was not strict JSON, returning raw text");
      parsed = { raw: response };
    }

    return parsed;
  } catch (error) {
    console.error("Error generating personalized roadmap:", error);
    throw new Error("Failed to generate personalized roadmap");
  }
}

/**
 * Generate a roadmap using Gemini 2.5 Flash model (legacy function)
 */
export async function generateRoadmap({ role, goal, duration }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
  You are an expert career mentor. Generate a **learning roadmap** for becoming a "${role}".
  
  Goal: ${goal}
  Duration: ${duration}

  Requirements:
  - Structure it in clear **phases** (e.g., Beginner, Intermediate, Advanced).
  - Include key **topics**, **tools**, and **skills** for each phase.
  - Mention estimated time for each step.
  - Format the response as **JSON** with this structure:

  {
    "title": "Roadmap Title",
    "phases": [
      {
        "phase": "Phase Name",
        "duration": "e.g. 2 weeks",
        "topics": ["Topic 1", "Topic 2", ...],
        "resources": [
          {"title": "Resource Name", "type": "Course/Book/Video", "url": "https://..."}
        ]
      }
    ]
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    // Attempt to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (jsonErr) {
      console.warn("AI response was not strict JSON, returning raw text");
      parsed = { raw: response };
    }

    return parsed;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw new Error("Failed to generate roadmap");
  }
}
