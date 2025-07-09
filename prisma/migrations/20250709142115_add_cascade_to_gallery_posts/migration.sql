-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GalleryAsset" (
    "galleryId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "GalleryAsset_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "GalleryPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GalleryAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GalleryAsset" ("assetId", "galleryId", "order") SELECT "assetId", "galleryId", "order" FROM "GalleryAsset";
DROP TABLE "GalleryAsset";
ALTER TABLE "new_GalleryAsset" RENAME TO "GalleryAsset";
CREATE UNIQUE INDEX "GalleryAsset_galleryId_assetId_key" ON "GalleryAsset"("galleryId", "assetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
