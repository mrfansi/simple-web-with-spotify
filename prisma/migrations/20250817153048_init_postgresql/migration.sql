-- CreateEnum
CREATE TYPE "public"."MusicType" AS ENUM ('TRACK', 'PLAYLIST', 'ALBUM');

-- CreateTable
CREATE TABLE "public"."spotify_tokens" (
    "id" SERIAL NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spotify_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."music_settings" (
    "id" SERIAL NOT NULL,
    "type" "public"."MusicType",
    "uri" TEXT,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "loop" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "music_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spotify_tokens_expiresAt_idx" ON "public"."spotify_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "music_settings_updatedAt_idx" ON "public"."music_settings"("updatedAt");
