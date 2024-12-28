-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssetTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_AssetTag" ("id", "name") SELECT "id", "name" FROM "AssetTag";
DROP TABLE "AssetTag";
ALTER TABLE "new_AssetTag" RENAME TO "AssetTag";
CREATE UNIQUE INDEX "AssetTag_name_key" ON "AssetTag"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
