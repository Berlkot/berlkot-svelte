/*
  Warnings:

  - Added the required column `path` to the `ThumbnailImage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ThumbnailImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    CONSTRAINT "ThumbnailImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ThumbnailImage" ("height", "id", "imageId", "width") SELECT "height", "id", "imageId", "width" FROM "ThumbnailImage";
DROP TABLE "ThumbnailImage";
ALTER TABLE "new_ThumbnailImage" RENAME TO "ThumbnailImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
