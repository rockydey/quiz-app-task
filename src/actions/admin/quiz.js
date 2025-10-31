"use server";

import { db } from "@/lib/db";

export const createQuiz = async ({ positionId, name, date, durationMin }) => {
  if (!positionId || !name) return { error: "Missing fields" };
  try {
    const quiz = await db.test.create({
      data: {
        name,
        date: date ? new Date(date) : new Date(),
        durationMin: durationMin ? Number(durationMin) : 30,
        positionId,
      },
    });
    return { success: "Quiz created", quiz };
  } catch {
    return { error: "Failed to create quiz" };
  }
};

export const listQuizzesByPosition = async (positionId) => {
  if (!positionId) return [];
  return db.test.findMany({
    where: { positionId },
    orderBy: { date: "desc" },
  });
};
