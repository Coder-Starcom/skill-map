"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimitedApiCall } from "@/lib/rate-limiter";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a shorter AI-powered roadmap for a given skill
 */
export async function generateShortRoadmap(skill, experienceLevel = "beginner") {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured. Please check your environment variables.");
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
    Create a comprehensive and practical learning roadmap for "${skill}" suitable for a ${experienceLevel} learner.
    
    IMPORTANT: This can be ANY skill - programming, design, marketing, cooking, photography, music, business, languages, etc.
    Adapt the roadmap structure and content to fit the specific skill domain.
    
    Requirements:
    - Generate exactly 30-40 steps (not more, not less)
    - Each step should be practical, actionable, and progressive
    - Include clear learning objectives and outcomes
    - Focus on essential skills, knowledge, and practical application
    - Make it sequential and build upon previous steps
    - Include hands-on practice, projects, and real-world applications
    - Provide diverse learning resources (articles, documentation, tools, books, practice exercises)
    - AVOID video links as they are often unavailable or outdated
    - Consider industry best practices and current trends for this skill
    
    For technical skills: Include coding exercises, projects, and tools
    For creative skills: Include practice exercises, portfolio projects, and inspiration
    For business skills: Include case studies, practical applications, and real scenarios
    For soft skills: Include practice scenarios, exercises, and real-world applications
    
    Return the response as a JSON object with this exact structure:
    {
      "name": "Comprehensive [Skill] Learning Path",
      "description": "Detailed description of what this roadmap covers and its benefits",
      "estimatedDuration": "X weeks",
      "difficulty": "beginner|intermediate|advanced",
      "steps": [
        {
          "id": "step-1",
          "title": "Clear, Actionable Step Title",
          "description": "Detailed description of what to learn, practice, and accomplish in this step",
          "duration": "X hours",
          "type": "theory|practice|project|assessment",
          "resources": [
            {
              "title": "Resource Title",
              "url": "https://example.com",
              "type": "article|documentation|tool|book|practice|course"
            }
          ]
        }
      ]
    }
    
    Make sure the JSON is valid, complete, and tailored specifically to "${skill}". 
    Focus on creating a practical, achievable learning path that will genuinely help someone master this skill.
    Use reliable resource types like articles, documentation, tools, books, and practice exercises.
    `;

    const result = await rateLimitedApiCall(async () => {
      return await model.generateContent(prompt);
    }, 25000); // 25 second timeout
    
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const roadmapData = JSON.parse(jsonMatch[0]);
      return roadmapData;
    } else {
      throw new Error("Could not parse roadmap JSON from AI response");
    }
    
  } catch (error) {
    console.error("Error generating short roadmap:", error);
    
    // Log specific error types but still return fallback data
    if (error.message.includes("API call timeout")) {
      console.log("Roadmap generation timed out, using fallback data");
    } else if (error.message.includes("API key")) {
      console.log("API key issue, using fallback data");
    } else if (error.message.includes("quota")) {
      console.log("API quota exceeded, using fallback data");
    } else if (error.message.includes("network")) {
      console.log("Network error, using fallback data");
    }
    
    // Fallback roadmap data - generic structure that works for any skill
    return {
      name: `Complete ${skill} Mastery Roadmap`,
      description: `A comprehensive learning path to master ${skill} from ${experienceLevel} level`,
      estimatedDuration: "8-12 weeks",
      difficulty: experienceLevel,
      steps: [
        {
          id: "step-1",
          title: `Understanding ${skill} Fundamentals`,
          description: `Learn the core concepts, principles, and foundational knowledge of ${skill}`,
          duration: "3-4 hours",
          type: "theory",
          resources: [
            {
              title: `${skill} Basics Guide`,
              url: "https://example.com",
              type: "article"
            },
            {
              title: `${skill} Official Documentation`,
              url: "https://example.com",
              type: "documentation"
            }
          ]
        },
        {
          id: "step-2",
          title: `Hands-on Practice with ${skill}`,
          description: `Apply your knowledge through practical exercises and real-world applications`,
          duration: "5-7 hours",
          type: "practice",
          resources: [
            {
              title: `${skill} Practice Exercises`,
              url: "https://example.com",
              type: "practice"
            },
            {
              title: `${skill} Tools and Resources`,
              url: "https://example.com",
              type: "tool"
            }
          ]
        },
        {
          id: "step-3",
          title: `Building Your First ${skill} Project`,
          description: `Create a complete project to demonstrate your ${skill} abilities`,
          duration: "8-10 hours",
          type: "project",
          resources: [
            {
              title: `${skill} Project Ideas`,
              url: "https://example.com",
              type: "article"
            },
            {
              title: `${skill} Best Practices Guide`,
              url: "https://example.com",
              type: "documentation"
            }
          ]
        }
      ]
    };
  }
}

/**
 * Save an AI-generated roadmap to the main roadmap section
 */
export async function saveAIRoadmap(roadmapData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Validate roadmap data
    if (!roadmapData || !roadmapData.name) {
      throw new Error("Invalid roadmap data");
    }

    // Get the user from database using clerkUserId
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Save the roadmap to the main roadmap section
    const savedRoadmap = await db.roadmap.create({
      data: {
        userId: user.id,
        title: roadmapData.name,
        content: roadmapData
      }
    });

    return { success: true, roadmapId: savedRoadmap.id };
  } catch (error) {
    console.error("Error saving AI roadmap:", error);
    throw new Error("Failed to save roadmap");
  }
}

/**
 * Complete an AI-generated roadmap and award a badge
 */
export async function completeAIRoadmap(roadmapId, roadmapName) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Generate a unique badge URL using DiceBear API
    const badgeUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${roadmapId}&backgroundColor=3b82f6&textColor=ffffff`;

    // Save the completion to database
    await db.userRoadmapCompletion.create({
      data: {
        userId,
        roadmapId,
        roadmapName,
        badgeUrl,
        badgeName: `${roadmapName} Master`
      }
    });

    return { success: true, badgeUrl };
  } catch (error) {
    console.error("Error completing AI roadmap:", error);
    throw new Error("Failed to complete roadmap");
  }
}

/**
 * Get user's AI roadmap badges
 */
export async function getUserAIRoadmapBadges() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const badges = await db.userRoadmapCompletion.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    });

    return badges;
  } catch (error) {
    console.error("Error fetching AI roadmap badges:", error);
    return [];
  }
}

/**
 * Get available roadmap templates
 */
export async function getRoadmapTemplates() {
  return [
    {
      id: "react-developer",
      name: "React Developer",
      description: "Complete roadmap to become a React developer",
      difficulty: "beginner",
      estimatedDuration: "10-12 weeks"
    },
    {
      id: "python-developer",
      name: "Python Developer", 
      description: "Learn Python programming from basics to advanced",
      difficulty: "beginner",
      estimatedDuration: "8-10 weeks"
    },
    {
      id: "data-scientist",
      name: "Data Scientist",
      description: "Comprehensive data science learning path",
      difficulty: "intermediate",
      estimatedDuration: "12-16 weeks"
    },
    {
      id: "devops-engineer",
      name: "DevOps Engineer",
      description: "Learn DevOps practices and tools",
      difficulty: "intermediate",
      estimatedDuration: "10-14 weeks"
    },
    {
      id: "ai-engineer",
      name: "AI Engineer",
      description: "Master AI and machine learning engineering",
      difficulty: "advanced",
      estimatedDuration: "14-18 weeks"
    }
  ];
}
