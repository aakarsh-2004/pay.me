/*
  Warnings:

  - Added the required column `timestamp` to the `p2pTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "p2pTransactions" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;
