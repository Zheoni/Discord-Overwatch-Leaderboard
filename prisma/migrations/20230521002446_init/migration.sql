-- CreateTable
CREATE TABLE "Leaderboard" (
    "channelId" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "title" TEXT,
    "splitRoles" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Account" (
    "leaderboardChannelId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "battleTag" TEXT NOT NULL,
    "userId" TEXT,

    PRIMARY KEY ("leaderboardChannelId", "playerId"),
    CONSTRAINT "Account_leaderboardChannelId_fkey" FOREIGN KEY ("leaderboardChannelId") REFERENCES "Leaderboard" ("channelId") ON DELETE CASCADE ON UPDATE CASCADE
);
