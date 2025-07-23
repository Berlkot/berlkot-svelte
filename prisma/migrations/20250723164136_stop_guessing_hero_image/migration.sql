-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GalleryFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "heroImageId" TEXT,
    "width" INTEGER NOT NULL DEFAULT 1,
    "height" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "GalleryFolder_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GalleryFolder" ("description", "id", "name") SELECT "description", "id", "name" FROM "GalleryFolder";
DROP TABLE "GalleryFolder";
ALTER TABLE "new_GalleryFolder" RENAME TO "GalleryFolder";
CREATE UNIQUE INDEX "GalleryFolder_name_key" ON "GalleryFolder"("name");
CREATE UNIQUE INDEX "GalleryFolder_heroImageId_key" ON "GalleryFolder"("heroImageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
