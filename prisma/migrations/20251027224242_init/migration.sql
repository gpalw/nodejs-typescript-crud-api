-- AlterTable
ALTER TABLE "User" ADD COLUMN     "terms_id" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_terms_id_fkey" FOREIGN KEY ("terms_id") REFERENCES "Terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
