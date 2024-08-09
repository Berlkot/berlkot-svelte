-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Berlkot',
    "content" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "visibility" INTEGER NOT NULL DEFAULT -1
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateTable
CREATE TABLE "ImagesInPosts" (
    "imageId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    PRIMARY KEY ("imageId", "postId"),
    CONSTRAINT "ImagesInPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImagesInPosts_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImageTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PostTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TagsOnImage" (
    "tagId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    PRIMARY KEY ("tagId", "imageId"),
    CONSTRAINT "TagsOnImage_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ImageTag" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TagsOnImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TagsOnPost" (
    "postTagId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    PRIMARY KEY ("postId", "postTagId"),
    CONSTRAINT "TagsOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TagsOnPost_postTagId_fkey" FOREIGN KEY ("postTagId") REFERENCES "PostTag" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_name_key" ON "Post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Image_path_key" ON "Image"("path");

-- CreateIndex
CREATE UNIQUE INDEX "ImageTag_name_key" ON "ImageTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PostTag_name_key" ON "PostTag"("name");
