"use server";

import { auth } from "@/zap/lib/auth/server";
import { headers } from "next/headers";
import type { Session } from "@/zap/lib/auth/client";

export const isAuthenticated = async () => {
  const session = await getSession();

  if (!session) {
    return false;
  }

  return true;
};

export const getUserId = async () => {
  const session = await getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  return session?.user.id;
};

export const getSession = async (): Promise<Session> => {
  return (await auth.api.getSession({
    headers: await headers(),
  })) as Session;
};

export const isUserAdmin = async () => {
  const session = await getSession();

  if (!session) {
    return false;
  }

  return session.user.role === "admin";
};
