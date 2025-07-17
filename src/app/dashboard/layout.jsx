import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout = async ({ children }) => {
  const session = await auth();
  console.log({ session });

  if (!session) redirect("/auth/login");

  return <div>{children}</div>;
};

export default DashboardLayout;
