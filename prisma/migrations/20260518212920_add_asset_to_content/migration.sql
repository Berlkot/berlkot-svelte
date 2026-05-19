-- CreateTable
CREATE TABLE "_AssetToContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssetToContent_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssetToContent_B_fkey" FOREIGN KEY ("B") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_AssetToContent_AB_unique" ON "_AssetToContent"("A", "B");

-- CreateIndex
CREATE INDEX "_AssetToContent_B_index" ON "_AssetToContent"("B");
