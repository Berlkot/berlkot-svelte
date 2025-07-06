-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Berlkot',
    "content" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN',
    "heroImageId" TEXT,
    CONSTRAINT "BlogPost_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "alt" TEXT,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "credit" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN'
);

-- CreateTable
CREATE TABLE "GalleryPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "smallDescription" TEXT,
    "largeDescription" TEXT,
    "copyright" TEXT DEFAULT 'CC BY-NC 4.0',
    "contentWarning" TEXT,
    "effects" JSONB,
    "maturity" TEXT NOT NULL DEFAULT 'SFW',
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN'
);

-- CreateTable
CREATE TABLE "GalleryAsset" (
    "galleryId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "GalleryAsset_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "GalleryPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GalleryAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Comic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "maturity" TEXT NOT NULL DEFAULT 'SFW',
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN'
);

-- CreateTable
CREATE TABLE "ComicChapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN',
    "comicId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComicChapter_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageInChapter" (
    "pageNumber" INTEGER NOT NULL,
    "effects" JSONB,
    "comicChapterId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    CONSTRAINT "PageInChapter_comicChapterId_fkey" FOREIGN KEY ("comicChapterId") REFERENCES "ComicChapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PageInChapter_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GalleryTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GalleryFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BlogPostToBlogPostTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BlogPostToBlogPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlogPostToBlogPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "BlogPostTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GalleryPostToGalleryTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GalleryPostToGalleryTag_A_fkey" FOREIGN KEY ("A") REFERENCES "GalleryPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GalleryPostToGalleryTag_B_fkey" FOREIGN KEY ("B") REFERENCES "GalleryTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GalleryFolderToGalleryPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GalleryFolderToGalleryPost_A_fkey" FOREIGN KEY ("A") REFERENCES "GalleryFolder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GalleryFolderToGalleryPost_B_fkey" FOREIGN KEY ("B") REFERENCES "GalleryPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_name_key" ON "BlogPost"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_name_key" ON "Asset"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPost_name_key" ON "GalleryPost"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAsset_galleryId_assetId_key" ON "GalleryAsset"("galleryId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Comic_name_key" ON "Comic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PageInChapter_comicChapterId_assetId_key" ON "PageInChapter"("comicChapterId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTag_name_key" ON "GalleryTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryFolder_name_key" ON "GalleryFolder"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTag_name_key" ON "BlogPostTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostToBlogPostTag_AB_unique" ON "_BlogPostToBlogPostTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostToBlogPostTag_B_index" ON "_BlogPostToBlogPostTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GalleryPostToGalleryTag_AB_unique" ON "_GalleryPostToGalleryTag"("A", "B");

-- CreateIndex
CREATE INDEX "_GalleryPostToGalleryTag_B_index" ON "_GalleryPostToGalleryTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GalleryFolderToGalleryPost_AB_unique" ON "_GalleryFolderToGalleryPost"("A", "B");

-- CreateIndex
CREATE INDEX "_GalleryFolderToGalleryPost_B_index" ON "_GalleryFolderToGalleryPost"("B");
