-- CreateTable
CREATE TABLE "Kayttaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kayttajatunnus" TEXT NOT NULL,
    "salasana" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Suosikki" (
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
    CONSTRAINT "Suosikki_kayttajaId_fkey" FOREIGN KEY ("kayttajaId") REFERENCES "Kayttaja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
