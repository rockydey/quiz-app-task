"use server";

import { db } from "@/lib/db";

export const createGroup = async ({ testId, name }) => {
  if (!testId || !name) return { error: "Missing fields" };
  try {
    const group = await db.group.create({ data: { testId, name } });
    return { success: "Group created", group };
  } catch {
    return { error: "Failed to create group" };
  }
};

export const listGroupsByTest = async (testId) => {
  if (!testId) return [];
  return db.group.findMany({ where: { testId }, orderBy: { name: "asc" } });
};
