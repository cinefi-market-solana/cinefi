/*
  Warnings:

  - You are about to drop the column `winRadius` on the `Market` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[onChainId]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `onChainId` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Market" DROP COLUMN "winRadius",
ADD COLUMN     "onChainId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Market_onChainId_key" ON "Market"("onChainId");
