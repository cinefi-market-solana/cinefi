/*
  Warnings:

  - You are about to drop the column `proximityScore` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `radiusFactor` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `weightedScore` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `signingWallet` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('EMAIL', 'GOOGLE');

-- DropIndex
DROP INDEX "User_walletAddress_idx";

-- DropIndex
DROP INDEX "User_walletAddress_key";

-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "proximityScore",
DROP COLUMN "radiusFactor",
DROP COLUMN "weightedScore",
ADD COLUMN     "payoutAmount" DECIMAL(30,10),
ADD COLUMN     "signingWallet" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "resolutionTimestamp" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "walletAddress",
ADD COLUMN     "authType" "AuthType",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "oauthProviderId" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "profileUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "totalWinnings" SET DEFAULT 0,
ALTER COLUMN "totalWinnings" SET DATA TYPE DECIMAL(30,10);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
