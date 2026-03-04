import prisma from "../lib/prisma";

const OTP_WINDOW_MS = 5 * 60 * 1000;
const OTP_RATE_WINDOW_MS = 30 * 60 * 1000;

export async function countRecentOtps(email: string): Promise<number> {
    const since = new Date(Date.now() - OTP_RATE_WINDOW_MS);
    return prisma.emailOtp.count({
        where: {
            email,
            createdAt: { gte: since },
        },
    });
}

export async function createOtp(email: string, otpHash: string) {
    return prisma.emailOtp.create({
        data: { email, otpHash },
    });
}

export async function verifyOtp(
    email: string,
    otpHash: string,
): Promise<boolean> {
    const since = new Date(Date.now() - OTP_WINDOW_MS);
    const record = await prisma.emailOtp.findFirst({
        where: {
            email,
            otpHash,
            createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
    });

    if (record) {
        await prisma.emailOtp.delete({ where: { id: record.id } });
    }

    return !!record;
}