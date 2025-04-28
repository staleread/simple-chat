/*
  Warnings:

  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `bio` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REGULAR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" CHAR(60) NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'REGULAR',
ALTER COLUMN "username" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(100);
