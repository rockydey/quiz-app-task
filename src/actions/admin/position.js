"use server";

import { db } from "@/lib/db";

export const createPosition = async (name) => {
  if (!name || !name.trim()) return { error: "Name is required" };
  try {
    const position = await db.position.create({ data: { name: name.trim() } });
    return { success: "Position created", position };
  } catch (e) {
    return { error: "Failed to create position" };
  }
};

export const listPositions = async () => {
  const positions = await db.position.findMany({ orderBy: { name: "asc" } });
  return positions;
};
