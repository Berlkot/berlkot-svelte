/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImageTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImagesInPosts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ImageToImageTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Image";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ImageTag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ImagesInPosts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ImageToImageTag";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "basename" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "ThumbnailImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    CONSTRAINT "ThumbnailImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AssetToAssetTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssetToAssetTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssetToAssetTag_B_fkey" FOREIGN KEY ("B") REFERENCES "AssetTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AssetToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssetToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssetToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_name_key" ON "Asset"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetTag_name_key" ON "AssetTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AssetToAssetTag_AB_unique" ON "_AssetToAssetTag"("A", "B");

-- CreateIndex
CREATE INDEX "_AssetToAssetTag_B_index" ON "_AssetToAssetTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssetToPost_AB_unique" ON "_AssetToPost"("A", "B");

-- CreateIndex
CREATE INDEX "_AssetToPost_B_index" ON "_AssetToPost"("B");
