-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "basename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
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
INSERT INTO "new_Asset" ("alt", "author", "basename", "contentWarning", "copyright", "creationDate", "height", "id", "inGallery", "largeDescription", "maturity", "name", "path", "smallDescription", "thumbnailInId", "title", "type", "visibility", "width") SELECT "alt", "author", "basename", "contentWarning", "copyright", "creationDate", "height", "id", "inGallery", "largeDescription", "maturity", "name", "path", "smallDescription", "thumbnailInId", "title", "type", "visibility", "width" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE UNIQUE INDEX "Asset_name_key" ON "Asset"("name");
CREATE UNIQUE INDEX "Asset_basename_key" ON "Asset"("basename");
CREATE UNIQUE INDEX "Asset_path_key" ON "Asset"("path");
CREATE UNIQUE INDEX "Asset_thumbnailInId_key" ON "Asset"("thumbnailInId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
