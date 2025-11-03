"use server";

import { db } from "@/lib/db";

export const createQuestion = async ({
  groupId,
  text,
  type, // "MCQ" | "TEXT"
  score,
  choices, // [{ text, isCorrect }...] for MCQ
}) => {
  if (!groupId || !text || !type || !score) return { error: "Missing fields" };
  try {
    const question = await db.question.create({
      data: {
        groupId,
        text,
        type,
        score: Number(score),
        choices:
          type === "MCQ" && Array.isArray(choices)
            ? {
                create: choices.map((c, idx) => ({
                  text: c.text,
                  index: idx,
                  isCorrect: !!c.isCorrect,
                })),
              }
            : undefined,
      },
      include: { choices: true },
    });

    // Also insert into TestQuestion for ordering
    const group = await db.group.findUnique({ where: { id: groupId } });
    if (group?.testId) {
      const last = await db.testQuestion.findFirst({
        where: { testId: group.testId },
        orderBy: { order: "desc" },
      });
      const nextOrder = (last?.order || 0) + 1;
      await db.testQuestion.create({
        data: { testId: group.testId, questionId: question.id, order: nextOrder },
      }).catch(() => {});
    }
    return { success: "Question created", question };
  } catch {
    return { error: "Failed to create question" };
  }
};

export const listQuestionsByGroup = async (groupId) => {
  if (!groupId) return [];
  return db.question.findMany({
    where: { groupId },
    orderBy: { text: "asc" },
    include: { choices: true },
  });
};
