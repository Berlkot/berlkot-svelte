ALTER TABLE "BlogPost" ADD COLUMN "new_content_id" TEXT;
ALTER TABLE "GalleryPost" ADD COLUMN "new_content_id" TEXT;

UPDATE "BlogPost" SET "new_content_id" = lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)));

UPDATE "GalleryPost" SET "new_content_id" = lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)));

CREATE TABLE "Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "markdown" TEXT NOT NULL,
    "html" TEXT
);

CREATE TABLE "_AssetToContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssetToContent_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssetToContent_B_fkey" FOREIGN KEY ("B") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Content" ("id", "markdown", "html")
SELECT "new_content_id", COALESCE("content", ''), NULL
FROM "BlogPost";

INSERT INTO "Content" ("id", "markdown", "html")
SELECT "new_content_id", COALESCE("largeDescription", ''), NULL
FROM "GalleryPost";


PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Berlkot',
    "contentId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN',
    "heroImageId" TEXT,
    CONSTRAINT "BlogPost_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_BlogPost" (
    "author", "createdAt", "description", "heroImageId", "id", "name", "title", "updatedAt", "visibility", "contentId"
) 
SELECT 
    "author", "createdAt", "description", "heroImageId", "id", "name", "title", "updatedAt", "visibility", "new_content_id" 
FROM "BlogPost";

DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_name_key" ON "BlogPost"("name");
CREATE UNIQUE INDEX "BlogPost_contentId_key" ON "BlogPost"("contentId");

CREATE TABLE "new_GalleryPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "smallDescription" TEXT,
    "contentId" TEXT NOT NULL,
    "copyright" TEXT DEFAULT 'CC BY-NC 4.0',
    "contentWarning" TEXT,
    "effects" JSONB,
    "maturity" TEXT NOT NULL DEFAULT 'SFW',
    "visibility" TEXT NOT NULL DEFAULT 'ADMIN',
    CONSTRAINT "GalleryPost_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_GalleryPost" (
    "contentWarning", "copyright", "creationDate", "effects", "id", "maturity", "name", "smallDescription", "title", "updatedAt", "visibility", "contentId"
) 
SELECT 
    "contentWarning", "copyright", "creationDate", "effects", "id", "maturity", "name", "smallDescription", "title", "updatedAt", "visibility", "new_content_id" 
FROM "GalleryPost";

DROP TABLE "GalleryPost";
ALTER TABLE "new_GalleryPost" RENAME TO "GalleryPost";
CREATE UNIQUE INDEX "GalleryPost_name_key" ON "GalleryPost"("name");
CREATE UNIQUE INDEX "GalleryPost_contentId_key" ON "GalleryPost"("contentId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

CREATE UNIQUE INDEX "_AssetToContent_AB_unique" ON "_AssetToContent"("A", "B");
CREATE INDEX "_AssetToContent_B_index" ON "_AssetToContent"("B");