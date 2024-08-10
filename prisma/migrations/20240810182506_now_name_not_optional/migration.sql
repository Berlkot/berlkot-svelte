/*
  Warnings:

  - Made the column `name` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Berlkot',
    "title" TEXT,
    "alt" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "contentWarning" TEXT,
    "copyright" TEXT,
    "smallDescription" TEXT,
    "largeDescription" TEXT,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inGallery" BOOLEAN NOT NULL DEFAULT false,
    "visibility" INTEGER NOT NULL DEFAULT -1,
    "maturity" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Image" ("alt", "author", "contentWarning", "copyright", "creationDate", "height", "id", "inGallery", "largeDescription", "maturity", "name", "path", "smallDescription", "title", "visibility", "width") SELECT "alt", "author", "contentWarning", "copyright", "creationDate", "height", "id", "inGallery", "largeDescription", "maturity", "name", "path", "smallDescription", "title", "visibility", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_name_key" ON "Image"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
