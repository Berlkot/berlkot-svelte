-- Preserve ownership before removing the old contentId columns.
-- Foreign keys stay disabled while tables are rebuilt to preserve join rows.
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TEMP TABLE "_ContentOwners" AS
SELECT "contentId", "id" AS "ownerId", 'blog' AS "kind" FROM "BlogPost"
UNION ALL
SELECT "contentId", "id", 'gallery' FROM "GalleryPost";
CREATE TABLE "new_BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Berlkot',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN',
    "heroImageId" TEXT,
    CONSTRAINT "BlogPost_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BlogPost" ("author", "createdAt", "description", "heroImageId", "id", "name", "title", "updatedAt", "visibility") SELECT "author", "createdAt", "description", "heroImageId", "id", "name", "title", "updatedAt", "visibility" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_name_key" ON "BlogPost"("name");
CREATE TABLE "new_Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "markdown" TEXT NOT NULL,
    "html" TEXT,
    "blogPostId" TEXT,
    "galleryPostId" TEXT,
    CONSTRAINT "Content_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Content_galleryPostId_fkey" FOREIGN KEY ("galleryPostId") REFERENCES "GalleryPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Content" ("html", "id", "markdown", "blogPostId", "galleryPostId")
SELECT c."html", c."id", c."markdown",
    (SELECT o."ownerId" FROM "_ContentOwners" o WHERE o."contentId" = c."id" AND o."kind" = 'blog'),
    (SELECT o."ownerId" FROM "_ContentOwners" o WHERE o."contentId" = c."id" AND o."kind" = 'gallery')
FROM "Content" c;
DROP TABLE "_ContentOwners";
DROP TABLE "Content";
ALTER TABLE "new_Content" RENAME TO "Content";
CREATE UNIQUE INDEX "Content_blogPostId_key" ON "Content"("blogPostId");
CREATE UNIQUE INDEX "Content_galleryPostId_key" ON "Content"("galleryPostId");
CREATE TABLE "new_GalleryPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "smallDescription" TEXT,
    "copyright" TEXT DEFAULT 'CC BY-NC 4.0',
    "contentWarning" TEXT,
    "effects" JSONB,
    "maturity" TEXT NOT NULL DEFAULT 'SFW',
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN'
);
INSERT INTO "new_GalleryPost" ("contentWarning", "copyright", "creationDate", "effects", "id", "maturity", "name", "smallDescription", "title", "updatedAt", "visibility") SELECT "contentWarning", "copyright", "creationDate", "effects", "id", "maturity", "name", "smallDescription", "title", "updatedAt", "visibility" FROM "GalleryPost";
DROP TABLE "GalleryPost";
ALTER TABLE "new_GalleryPost" RENAME TO "GalleryPost";
CREATE UNIQUE INDEX "GalleryPost_name_key" ON "GalleryPost"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
