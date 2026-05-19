/*
  Warnings:

  - You are about to drop the `_AssetToContent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[hash]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN "hash" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_AssetToContent";
PRAGMA foreign_keys=on;

-- CreateIndex
CREATE UNIQUE INDEX "Asset_hash_key" ON "Asset"("hash");
