-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('UPCOMING', 'BETTING_OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRAILER_DROP', 'BETTING_OPEN', 'MARKET_RESOLVED');

-- CreateEnum
CREATE TYPE "HypeLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "fcmToken" TEXT,
    "fcmTokenUpdatedAt" TIMESTAMP(3),
    "genrePreferences" TEXT[],
    "totalBets" INTEGER NOT NULL DEFAULT 0,
    "totalWinnings" BIGINT NOT NULL DEFAULT 0,
    "averageAccuracy" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "posterUrl" TEXT,
    "trailerUrl" TEXT,
    "releaseDate" TIMESTAMP(3),
    "genres" TEXT[],
    "status" "MovieStatus" NOT NULL DEFAULT 'UPCOMING',
    "hypeLevel" "HypeLevel" NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "programAddress" TEXT NOT NULL,
    "switchboardFeedPubkey" TEXT NOT NULL,
    "winRadius" INTEGER NOT NULL,
    "baseMintBet" BIGINT NOT NULL,
    "marketOpenDate" TIMESTAMP(3) NOT NULL,
    "bettingClosesAt" TIMESTAMP(3) NOT NULL,
    "totalPool" BIGINT NOT NULL DEFAULT 0,
    "totalStakeSum" BIGINT NOT NULL DEFAULT 0,
    "betCount" INTEGER NOT NULL DEFAULT 0,
    "averageCrowdPrediction" DECIMAL(5,2),
    "resolvedAt" TIMESTAMP(3),
    "finalScore" DECIMAL(5,2),
    "status" "MarketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "transactionSignature" TEXT NOT NULL,
    "predictedScore" DECIMAL(5,2) NOT NULL,
    "timeMultiplier" DECIMAL(4,3) NOT NULL,
    "proximityScore" DECIMAL(8,6),
    "radiusFactor" DECIMAL(4,3),
    "weightedScore" DECIMAL(20,6),
    "stakeAmount" BIGINT NOT NULL,
    "dayOfPrediction" INTEGER NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_totalWinnings_idx" ON "User"("totalWinnings");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_slug_key" ON "Movie"("slug");

-- CreateIndex
CREATE INDEX "Movie_status_idx" ON "Movie"("status");

-- CreateIndex
CREATE INDEX "Movie_releaseDate_idx" ON "Movie"("releaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "Market_movieId_key" ON "Market"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Market_programAddress_key" ON "Market"("programAddress");

-- CreateIndex
CREATE INDEX "Market_status_idx" ON "Market"("status");

-- CreateIndex
CREATE INDEX "Market_bettingClosesAt_idx" ON "Market"("bettingClosesAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_transactionSignature_key" ON "Bet"("transactionSignature");

-- CreateIndex
CREATE INDEX "Bet_userId_marketId_idx" ON "Bet"("userId", "marketId");

-- CreateIndex
CREATE INDEX "Bet_marketId_idx" ON "Bet"("marketId");

-- CreateIndex
CREATE INDEX "Bet_userId_idx" ON "Bet"("userId");

-- CreateIndex
CREATE INDEX "Bet_marketId_claimed_idx" ON "Bet"("marketId", "claimed");

-- CreateIndex
CREATE INDEX "NotificationLog_movieId_type_idx" ON "NotificationLog"("movieId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_userId_movieId_type_key" ON "NotificationLog"("userId", "movieId", "type");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
