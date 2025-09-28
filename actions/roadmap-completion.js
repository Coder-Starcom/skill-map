"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Mark roadmap as completed and award badge
 */
export async function completeRoadmap(roadmapId, roadmapName) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Check if already completed
  const existingCompletion = await db.userRoadmapCompletion.findFirst({
    where: {
      userId: user.id,
      roadmapId: roadmapId,
    },
  });

  if (existingCompletion) {
    return existingCompletion; // Already completed
  }

  // Create completion record with badge
  const completion = await db.userRoadmapCompletion.create({
    data: {
      userId: user.id,
      roadmapId: roadmapId,
      roadmapName: roadmapName,
      badgeName: `${roadmapName} Master`,
      badgeUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${roadmapName}&backgroundColor=4f46e5&textColor=ffffff`,
    },
  });

  revalidatePath("/badges");
  revalidatePath("/dashboard");
  return completion;
}

/**
 * Get user's roadmap completion badges
 */
export async function getUserRoadmapBadges() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.userRoadmapCompletion.findMany({
    where: { 
      userId: user.id,
    },
    orderBy: { completedAt: 'desc' },
  });
}
