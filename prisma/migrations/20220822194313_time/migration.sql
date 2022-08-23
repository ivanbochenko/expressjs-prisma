/*
  Warnings:

  - You are about to drop the column `author_id` on the `Match` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_author_id_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "author_id",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "accepted" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
