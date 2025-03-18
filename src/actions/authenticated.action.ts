"use server";

import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export const isAuthenticated = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return false;
  }

  return true;
};

export const getUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User not authenticated");
  }

  return session?.user.id;
};

export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const isUserAdmin = async () => {
  const session = await getSession();

  if (!session) {
    return false;
  }

  return session.user.role === "admin";
};
