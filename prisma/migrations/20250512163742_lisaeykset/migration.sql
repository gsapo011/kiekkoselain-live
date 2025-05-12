/*
  Warnings:

  - You are about to drop the `Kayttaja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Suosikki` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Kayttaja";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Suosikki";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "kayttaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kayttajatunnus" TEXT NOT NULL,
    "salasana" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "suosikki" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kayttajaId" INTEGER NOT NULL,
    "kiekkoId" TEXT NOT NULL,
    "nimi" TEXT NOT NULL,
    "valmistaja" TEXT NOT NULL,
    "kategoria" TEXT,
    "nopeus" TEXT NOT NULL,
    "liito" TEXT NOT NULL,
    "vakaus" TEXT NOT NULL,
    "feidi" TEXT NOT NULL,
    "kuva" TEXT,
    "stability" TEXT,
    CONSTRAINT "suosikki_kayttajaId_fkey" FOREIGN KEY ("kayttajaId") REFERENCES "kayttaja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
