/*
  Warnings:

  - You are about to drop the `TagsOnImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagsOnPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TagsOnImage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TagsOnPost";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_PostToPostTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PostToPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PostToPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "PostTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ImageToImageTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ImageToImageTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ImageToImageTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ImageTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostToPostTag_AB_unique" ON "_PostToPostTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToPostTag_B_index" ON "_PostToPostTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImageToImageTag_AB_unique" ON "_ImageToImageTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ImageToImageTag_B_index" ON "_ImageToImageTag"("B");
