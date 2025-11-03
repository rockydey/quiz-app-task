"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

function arraysEqualAsSets(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const as = [...new Set(a.map(Number))].sort();
  const bs = [...new Set(b.map(Number))].sort();
  return as.every((v, i) => v === bs[i]);
}

export const startOrGetSession = async (testId) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  // ensure user is assigned this test
  const assigned = await db.assignedTest.findFirst({
    where: { userId, testId },
  });
  if (!assigned) return { error: "Test not assigned" };

  let userSession = await db.userTestSession.findFirst({
    where: { userId, testId },
    orderBy: { startedAt: "desc" },
  });

  if (!userSession || userSession.submitted) {
    userSession = await db.userTestSession.create({
      data: { userId, testId, startedAt: new Date() },
    });
  }

  const test = await db.test.findUnique({
    where: { id: testId },
    include: {
      testQuestions: {
        orderBy: { order: "asc" },
        include: {
          question: { include: { choices: true } },
        },
      },
    },
  });

  if (!test) return { error: "Test not found" };

  const existingAnswers = await db.userAnswer.findMany({
    where: { testSessionId: userSession.id },
  });

  return {
    ok: true,
    session: userSession,
    test,
    answers: existingAnswers,
  };
};

export const saveAnswer = async ({ testSessionId, questionId, response }) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  const s = await db.userTestSession.findUnique({ where: { id: testSessionId } });
  if (!s || s.userId !== userId) return { error: "Forbidden" };
  if (s.submitted) return { error: "Test already submitted" };

  const question = await db.question.findUnique({
    where: { id: questionId },
    include: { choices: true },
  });
  if (!question) return { error: "Question not found" };

  // Normalize response to string; MCQ: comma-separated indices; TEXT: plain text
  let responseString = "";
  if (question.type === "MCQ") {
    const arr = Array.isArray(response)
      ? response.map((v) => Number(v))
      : String(response || "")
          .split(",")
          .map((v) => Number(v))
          .filter((v) => !Number.isNaN(v));
    responseString = arr.join(",");
  } else {
    responseString = String(response || "");
  }

  // Upsert answer
  const answer = await db.userAnswer.upsert({
    where: {
      testSessionId_questionId: {
        testSessionId: s.id,
        questionId: question.id,
      },
    },
    update: { response: responseString },
    create: {
      testSessionId: s.id,
      questionId: question.id,
      response: responseString,
    },
  }).catch(async () => {
    // If composite unique doesn't exist in schema, fall back to find+update
    const existing = await db.userAnswer.findFirst({
      where: { testSessionId: s.id, questionId: question.id },
    });
    if (existing) {
      return db.userAnswer.update({ where: { id: existing.id }, data: { response: responseString } });
    }
    return db.userAnswer.create({
      data: { testSessionId: s.id, questionId: question.id, response: responseString },
    });
  });

  // Autoscore MCQ
  let autoScore = null;
  if (question.type === "MCQ") {
    const correct = question.choices
      .filter((c) => c.isCorrect)
      .map((c) => c.index);
    const selected = responseString
      .split(",")
      .filter(Boolean)
      .map((v) => Number(v));
    autoScore = arraysEqualAsSets(correct, selected) ? question.score : 0;
    await db.userAnswer.update({ where: { id: answer.id }, data: { autoScore } });
  }

  return { success: "Saved", answerId: answer.id, autoScore };
};

export const submitTest = async ({ testSessionId }) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };
  const s = await db.userTestSession.findUnique({ where: { id: testSessionId } });
  if (!s || s.userId !== userId) return { error: "Forbidden" };
  if (s.submitted) return { success: "Already submitted" };

  // compute total
  const answers = await db.userAnswer.findMany({ where: { testSessionId: s.id } });
  const totalScore = answers.reduce((acc, a) => acc + (a.givenScore ?? a.autoScore ?? 0), 0);

  const updated = await db.userTestSession.update({
    where: { id: s.id },
    data: { submitted: true, endedAt: new Date(), totalScore },
  });

  return { success: "Submitted", session: updated };
};


