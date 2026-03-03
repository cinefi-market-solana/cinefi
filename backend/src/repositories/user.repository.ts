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

