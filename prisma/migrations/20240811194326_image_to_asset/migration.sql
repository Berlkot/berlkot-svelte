/*
  Warnings:

  - You are about to drop the column `imageId` on the `ThumbnailImage` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `ThumbnailImage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ThumbnailImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    CONSTRAINT "ThumbnailImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ThumbnailImage" ("height", "id", "path", "width") SELECT "height", "id", "path", "width" FROM "ThumbnailImage";
DROP TABLE "ThumbnailImage";
ALTER TABLE "new_ThumbnailImage" RENAME TO "ThumbnailImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
