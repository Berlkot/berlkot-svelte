/*
  Warnings:

  - A unique constraint covering the columns `[basename]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `height` to the `ThumbnailImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `ThumbnailImage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ThumbnailImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    CONSTRAINT "ThumbnailImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ThumbnailImage" ("id", "imageId") SELECT "id", "imageId" FROM "ThumbnailImage";
DROP TABLE "ThumbnailImage";
ALTER TABLE "new_ThumbnailImage" RENAME TO "ThumbnailImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Asset_basename_key" ON "Asset"("basename");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_path_key" ON "Asset"("path");
