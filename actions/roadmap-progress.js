"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Save or update roadmap progress for a user
 */
export async function saveRoadmapProgress(roadmapId, roadmapName, currentStep, completedSteps) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const progress = await db.userRoadmapProgress.upsert({
      where: {
        userId_roadmapId: {
          userId: user.id,
          roadmapId: roadmapId
        }
      },
      update: {
        currentStep,
        completedSteps: Array.from(completedSteps),
        lastAccessed: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        roadmapId,
        roadmapName,
        currentStep,
        completedSteps: Array.from(completedSteps),
        lastAccessed: new Date()
      }
    });

    revalidatePath("/roadmap");
    return progress;
  } catch (error) {
    console.error("Error saving roadmap progress:", error);
    throw new Error("Failed to save roadmap progress");
  }
}

/**
 * Get roadmap progress for a user
 */
export async function getRoadmapProgress(roadmapId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const progress = await db.userRoadmapProgress.findUnique({
      where: {
        userId_roadmapId: {
          userId: user.id,
          roadmapId: roadmapId
        }
      }
    });

    return progress;
  } catch (error) {
    console.error("Error getting roadmap progress:", error);
    return null;
  }
}

/**
 * Get all roadmap progress for a user
 */
export async function getAllRoadmapProgress() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const progress = await db.userRoadmapProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastAccessed: "desc" }
    });

    return progress;
  } catch (error) {
    console.error("Error getting all roadmap progress:", error);
    return [];
  }
}
