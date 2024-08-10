/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Image_path_key";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Image_name_key" ON "Image"("name");
