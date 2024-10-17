/*
  Warnings:

  - You are about to drop the `ThumbnailImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `basename` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Asset` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ThumbnailImage";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Berlkot',
    "title" TEXT,
    "alt" TEXT,
    "type" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "contentWarning" TEXT,
    "copyright" TEXT,
    "smallDescription" TEXT,
    "largeDescription" TEXT,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inGallery" BOOLEAN NOT NULL DEFAULT false,
    "visibility" INTEGER NOT NULL DEFAULT -1,
    "maturity" INTEGER NOT NULL DEFAULT 0,
    "thumbnailInId" TEXT,
    CONSTRAINT "Asset_thumbnailInId_fkey" FOREIGN KEY ("thumbnailInId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Asset" ("alt", "author", "contentWarning", "copyright", "creationDate", "height", "id", "inGallery", "largeDescription", "maturity", "name", "smallDescription", "thumbnailInId", "title", "type", "visibility", "width") SELECT "alt", "author", "contentWarning", "copyright", "creationDate", "height", "id", "inGallery", "largeDescription", "maturity", "name", "smallDescription", "thumbnailInId", "title", "type", "visibility", "width" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE UNIQUE INDEX "Asset_name_key" ON "Asset"("name");
CREATE UNIQUE INDEX "Asset_thumbnailInId_key" ON "Asset"("thumbnailInId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
