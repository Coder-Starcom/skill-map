"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
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
      console.log("❌ Gemini API key not found in environment variables");
      throw new Error("Gemini API key not configured. Please check your environment variables.");
    }
    
    console.log("✅ Gemini API key found, generating roadmap for:", skill);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
    Create a learning roadmap for "${skill}" (${experienceLevel} level) with 20-25 steps.
    
    Return JSON format:
    {
      "name": "${skill} Learning Roadmap",
      "description": "Practical learning path for ${skill}",
      "estimatedDuration": "8-12 weeks",
      "difficulty": "${experienceLevel}",
      "steps": [
        {
          "id": "step-1",
          "title": "Step Title",
          "description": "What to learn in this step",
          "duration": "2-3 hours",
          "type": "theory",
          "resources": [
            {
              "title": "Resource Name",
              "url": "https://example.com",
              "type": "article"
            }
          ]
        }
      ]
    }
    
    Keep it concise and practical.
    `;

    console.log("🚀 Making API call to Gemini (no restrictions)...");
    const result = await model.generateContent(prompt);
    
    console.log("✅ API call successful, parsing response...");
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
    
    // Generate skill-specific fallback data
    const generateFallbackRoadmap = (skill, level) => {
      const skillLower = skill.toLowerCase();
      
      if (skillLower.includes('video') || skillLower.includes('editor') || skillLower.includes('editing')) {
        return {
          name: `Complete Video Editing Mastery Roadmap`,
          description: `A comprehensive learning path to master video editing from ${level} level`,
          estimatedDuration: "10-14 weeks",
          difficulty: level,
          steps: [
            {
              id: "step-1",
              title: "Video Editing Fundamentals",
              description: "Learn basic video editing concepts, timeline, cuts, and transitions",
              duration: "4-6 hours",
              type: "theory",
              resources: [
                { title: "Video Editing Basics Guide", url: "https://www.adobe.com/creativecloud/video/discover/video-editing-basics.html", type: "article" },
                { title: "Understanding Video Formats", url: "https://www.videomaker.com/article/c10/18146-understanding-video-formats", type: "article" }
              ]
            },
            {
              id: "step-2",
              title: "Choose Your Editing Software",
              description: "Learn Adobe Premiere Pro, Final Cut Pro, or DaVinci Resolve basics",
              duration: "6-8 hours",
              type: "practice",
              resources: [
                { title: "Premiere Pro Tutorial", url: "https://helpx.adobe.com/premiere-pro/tutorials.html", type: "documentation" },
                { title: "Final Cut Pro Guide", url: "https://support.apple.com/final-cut-pro", type: "documentation" }
              ]
            },
            {
              id: "step-3",
              title: "Audio Editing and Mixing",
              description: "Learn to edit audio, remove noise, and balance levels",
              duration: "5-7 hours",
              type: "practice",
              resources: [
                { title: "Audio Editing Fundamentals", url: "https://www.soundonsound.com/techniques/audio-editing-fundamentals", type: "article" },
                { title: "Audio Mixing Guide", url: "https://www.musicradar.com/how-to/mixing-guide", type: "article" }
              ]
            },
            {
              id: "step-4",
              title: "Color Correction and Grading",
              description: "Learn color theory, correction, and cinematic grading techniques",
              duration: "7-9 hours",
              type: "practice",
              resources: [
                { title: "Color Grading Basics", url: "https://www.premiumbeat.com/blog/color-grading-basics/", type: "article" },
                { title: "DaVinci Resolve Color", url: "https://www.blackmagicdesign.com/products/davinciresolve", type: "tool" }
              ]
            },
            {
              id: "step-5",
              title: "Motion Graphics and Effects",
              description: "Add titles, graphics, and visual effects to your videos",
              duration: "8-10 hours",
              type: "project",
              resources: [
                { title: "After Effects Basics", url: "https://helpx.adobe.com/after-effects/tutorials.html", type: "documentation" },
                { title: "Motion Graphics Guide", url: "https://www.schoolofmotion.com/blog/motion-graphics-guide", type: "article" }
              ]
            },
            {
              id: "step-6",
              title: "Create Your First Video Project",
              description: "Edit a complete video from start to finish using all learned techniques",
              duration: "10-12 hours",
              type: "project",
              resources: [
                { title: "Video Project Ideas", url: "https://www.videomaker.com/article/c10/18146-video-project-ideas", type: "article" },
                { title: "Export Settings Guide", url: "https://www.premiumbeat.com/blog/video-export-settings-guide/", type: "article" }
              ]
            }
          ]
        };
      }
      
      // Generic fallback for other skills
      return {
        name: `Complete ${skill} Mastery Roadmap`,
        description: `A comprehensive learning path to master ${skill} from ${level} level`,
        estimatedDuration: "8-12 weeks",
        difficulty: level,
        steps: [
          {
            id: "step-1",
            title: `Understanding ${skill} Fundamentals`,
            description: `Learn the core concepts, principles, and foundational knowledge of ${skill}`,
            duration: "3-4 hours",
            type: "theory",
            resources: [
              { title: `${skill} Basics Guide`, url: "https://example.com", type: "article" },
              { title: `${skill} Official Documentation`, url: "https://example.com", type: "documentation" }
            ]
          },
          {
            id: "step-2",
            title: `Hands-on Practice with ${skill}`,
            description: `Apply your knowledge through practical exercises and real-world applications`,
            duration: "5-7 hours",
            type: "practice",
            resources: [
              { title: `${skill} Practice Exercises`, url: "https://example.com", type: "practice" },
              { title: `${skill} Tools and Resources`, url: "https://example.com", type: "tool" }
            ]
          },
          {
            id: "step-3",
            title: `Building Your First ${skill} Project`,
            description: `Create a complete project to demonstrate your ${skill} abilities`,
            duration: "8-10 hours",
            type: "project",
            resources: [
              { title: `${skill} Project Ideas`, url: "https://example.com", type: "article" },
              { title: `${skill} Best Practices Guide`, url: "https://example.com", type: "documentation" }
            ]
          }
        ]
      };
    };
    
    return generateFallbackRoadmap(skill, experienceLevel);
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
