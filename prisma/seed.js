import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@test.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  await prisma.user.upsert({
    where: { email: "john@test.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@test.com",
      password: userPassword,
      role: "CANDIDATE",
      emailVerified: new Date(),
    },
  });

  // Upsert a Position
  const position = await prisma.position.upsert({
    where: { name: "Frontend Developer" },
    update: {},
    create: { name: "Frontend Developer" },
  });

  // Create a Quiz
  const quiz = await prisma.test.create({
    data: {
      name: "Frontend Screening",
      date: new Date(),
      durationMin: 45,
      positionId: position.id,
    },
  });

  // Create Groups
  const logic = await prisma.group.create({
    data: { name: "Logic", testId: quiz.id },
  });

  const javascript = await prisma.group.create({
    data: { name: "JavaScript", testId: quiz.id },
  });

  // Questions - Logic (TEXT)
  await prisma.question.create({
    data: {
      groupId: logic.id,
      text: "Explain the difference between breadth-first and depth-first search.",
      type: "TEXT",
      score: 5,
    },
  });

  // Questions - JavaScript (MCQ multi-correct)
  await prisma.question.create({
    data: {
      groupId: javascript.id,
      text: "Which of the following are true about 'const' in JavaScript?",
      type: "MCQ",
      score: 3,
      choices: {
        create: [
          { text: "Variables cannot be reassigned", index: 0, isCorrect: true },
          {
            text: "Variables cannot be redeclared in same scope",
            index: 1,
            isCorrect: true,
          },
          { text: "Values are always immutable", index: 2, isCorrect: false },
          {
            text: "Binding must be initialized at declaration",
            index: 3,
            isCorrect: true,
          },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      groupId: javascript.id,
      text: "Select all truthy values in JS:",
      type: "MCQ",
      score: 2,
      choices: {
        create: [
          { text: "[]", index: 0, isCorrect: true },
          { text: "''", index: 1, isCorrect: false },
          { text: "{}", index: 2, isCorrect: true },
          { text: "0", index: 3, isCorrect: false },
        ],
      },
    },
  });

  // Link questions into TestQuestion for ordering/count
  const allQuizQuestions = await prisma.question
    .findMany({
      where: { group: { testId: quiz.id } },
      orderBy: { createdAt: "asc" },
    })
    .catch(() =>
      prisma.question.findMany({
        where: { groupId: { in: [logic.id, javascript.id] } },
      })
    );

  let order = 1;
  for (const q of allQuizQuestions) {
    await prisma.testQuestion
      .create({
        data: { testId: quiz.id, questionId: q.id, order: order++ },
      })
      .catch(() => {});
  }

  // Create two more demo tests
  const jsFundamentals = await prisma.test.create({
    data: {
      name: "JavaScript Fundamentals Quiz",
      date: new Date(),
      durationMin: 60,
      positionId: position.id,
    },
  });
  const reactAdvanced = await prisma.test.create({
    data: {
      name: "React Advanced Concepts",
      date: new Date(),
      durationMin: 120,
      positionId: position.id,
    },
  });

  // Reuse existing questions for demo tests
  order = 1;
  for (const q of allQuizQuestions) {
    await prisma.testQuestion
      .create({
        data: { testId: jsFundamentals.id, questionId: q.id, order: order++ },
      })
      .catch(() => {});
  }
  order = 1;
  for (const q of allQuizQuestions) {
    await prisma.testQuestion
      .create({
        data: { testId: reactAdvanced.id, questionId: q.id, order: order++ },
      })
      .catch(() => {});
  }

  // Assign tests to candidate user
  const candidate = await prisma.user.findUnique({
    where: { email: "john@test.com" },
  });
  if (candidate) {
    const a1 = await prisma.assignedTest.create({
      data: { userId: candidate.id, testId: quiz.id, assignedAt: new Date() },
    });
    const a2 = await prisma.assignedTest.create({
      data: {
        userId: candidate.id,
        testId: jsFundamentals.id,
        assignedAt: new Date(),
      },
    });
    const a3 = await prisma.assignedTest.create({
      data: {
        userId: candidate.id,
        testId: reactAdvanced.id,
        assignedAt: new Date(),
      },
    });

    // Completed session for first test
    await prisma.userTestSession.create({
      data: {
        userId: candidate.id,
        testId: quiz.id,
        startedAt: new Date(Date.now() - 50 * 60 * 1000),
        endedAt: new Date(Date.now() - 5 * 60 * 1000),
        submitted: true,
        totalScore: 85,
      },
    });

    // In-progress session for second test
    await prisma.userTestSession.create({
      data: {
        userId: candidate.id,
        testId: jsFundamentals.id,
        startedAt: new Date(Date.now() - 25 * 60 * 1000),
        submitted: false,
        totalScore: 0,
      },
    });

    // Third test: no session → Not Started
  }

  // Additional demo: Another position and tests
  const backendPosition = await prisma.position.upsert({
    where: { name: "Backend Developer" },
    update: {},
    create: { name: "Backend Developer" },
  });

  const nodeBasics = await prisma.test.create({
    data: {
      name: "Node.js Basics",
      date: new Date(),
      durationMin: 40,
      positionId: backendPosition.id,
    },
  });

  // Link existing JS questions into Node test too
  let order2 = 1;
  for (const q of allQuizQuestions) {
    await prisma.testQuestion
      .create({
        data: { testId: nodeBasics.id, questionId: q.id, order: order2++ },
      })
      .catch(() => {});
  }

  if (candidate) {
    await prisma.assignedTest
      .create({
        data: { userId: candidate.id, testId: nodeBasics.id, assignedAt: new Date() },
      })
      .catch(() => {});
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
