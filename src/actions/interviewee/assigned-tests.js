"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const listAssignedTestsForCurrentUser = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const assigned = await db.assignedTest.findMany({
    where: { userId },
    orderBy: { assignedAt: "desc" },
    include: {
      test: {
        include: {
          position: true,
          testQuestions: true,
          groups: true,
        },
      },
      user: true,
    },
  });

  // Attach latest session (if any)
  const testIds = assigned.map((a) => a.testId);
  const sessions = await db.userTestSession.findMany({
    where: { userId, testId: { in: testIds } },
    orderBy: { startedAt: "desc" },
  });
  const key = (t) => `${t.testId}`;
  const latestByTest = new Map();
  for (const s of sessions) {
    if (!latestByTest.has(key(s))) latestByTest.set(key(s), s);
  }

  return assigned.map((a) => ({
    ...a,
    latestSession: latestByTest.get(a.testId) || null,
  }));
};
