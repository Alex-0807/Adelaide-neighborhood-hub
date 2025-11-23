/*
  Warnings:

  - You are about to drop the column `content` on the `ChargingStation` table. All the data in the column will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `lat` to the `ChargingStation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `ChargingStation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- AlterTable
ALTER TABLE "ChargingStation" DROP COLUMN "content",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "public"."Favorite";

-- CreateTable
CREATE TABLE "Favourite" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "Favourite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favourite_userId_postId_key" ON "Favourite"("userId", "postId");

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ChargingStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
