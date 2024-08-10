-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TagsOnImage" (
    "tagId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    PRIMARY KEY ("tagId", "imageId"),
    CONSTRAINT "TagsOnImage_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ImageTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TagsOnImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TagsOnImage" ("imageId", "tagId") SELECT "imageId", "tagId" FROM "TagsOnImage";
DROP TABLE "TagsOnImage";
ALTER TABLE "new_TagsOnImage" RENAME TO "TagsOnImage";
CREATE TABLE "new_TagsOnPost" (
    "postTagId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    PRIMARY KEY ("postId", "postTagId"),
    CONSTRAINT "TagsOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TagsOnPost_postTagId_fkey" FOREIGN KEY ("postTagId") REFERENCES "PostTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TagsOnPost" ("postId", "postTagId") SELECT "postId", "postTagId" FROM "TagsOnPost";
DROP TABLE "TagsOnPost";
ALTER TABLE "new_TagsOnPost" RENAME TO "TagsOnPost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
