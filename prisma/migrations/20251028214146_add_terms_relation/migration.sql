/*
  Warnings:

  - You are about to drop the column `terms_id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_terms_id_fkey";

-- AlterTable
ALTER TABLE "Terms" ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "terms_id",
ADD COLUMN     "termsId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "Terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
