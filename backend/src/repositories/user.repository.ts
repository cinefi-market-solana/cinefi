import { AuthType, Role } from "@prisma/client";
import prisma from "../lib/prisma";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(params: {
  email: string;
  name?: string | null;
  password: string;
  role?: Role;
  authType?: AuthType;
}) {
  const { email, name, password, role = Role.USER, authType = AuthType.EMAIL } = params;
  return prisma.user.create({
    data: {
      email,
      name: name ?? null,
      password,
      role,
      authType,
      genrePreferences: [],
    },
  });
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { password: passwordHash },
  });
}

export async function upsertUserByWallet(email: string) {
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      genrePreferences: [],
    },
    update: {},
  });
}

export async function getUserByWallet(walletAddress: string) {
  return prisma.user.findUnique({
    where: { email: walletAddress },
  });
}

export async function updateUserNotificationPreferences(params: {
  walletAddress: string;
  fcmToken?: string;
  genres?: string[];
}) {
  const { walletAddress, fcmToken, genres } = params;
  return prisma.user.update({
    where: { email: walletAddress },
    data: {
      ...(typeof fcmToken !== "undefined" && { fcmToken }),
      ...(typeof genres !== "undefined" && { genrePreferences: genres }),
    },
  });
}

export async function getUsersByIds(userIds: string[]) {
  return prisma.user.findMany({
    where: { id: { in: userIds } },
  });
}

export async function clearFcmTokenForUsers(userIds: string[]) {
  await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: { fcmToken: null },
  });
}

