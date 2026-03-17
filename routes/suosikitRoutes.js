"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const node_fetch_1 = __importDefault(require("node-fetch"));
const suosikitRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Mahdollistetaan JSON-pyynnöt
suosikitRouter.use((0, express_1.json)());
// Suosikin lisäys
suosikitRouter.post("/", async (req, res) => {
    // Debug: console.log(req.body);
    // Tarkastetaan, että kayttajaId ja kiekkoId on lähetetty pyynnössä
    const { kayttajaId, kiekkoId } = req.body;
    if (!kayttajaId || !kiekkoId) {
        console.error("Virhe: kayttajaId tai kiekkoId puuttuu.");
        return res.status(400).json({ virhe: "kayttajaId ja kiekkoId vaaditaan." });
    }
    try {
        // Haetaan kaikki kiekot ulkoisesta API:sta
        const response = await (0, node_fetch_1.default)("https://discit-api.fly.dev/disc");
        const kaikkiKiekot = await response.json();
        // Etsitään oikea kiekko annetulla  kiekkoId:llä
        const kiekko = kaikkiKiekot.find((k) => k.id === kiekkoId);
        // Virheilmoitus, jos kiekkoa ei löydy
        if (!kiekko) {
            console.error("Virhe: Kiekkoa ei löytynyt id:llä.", kiekkoId);
            return res.status(404).json({ virhe: "Kiekkoa ei löytynyt annetulla id:llä." });
        }
        // Lisätään suosikiksi käyttäjälle
        const suosikki = await prisma.suosikki.create({
            data: {
                kayttajaId: kayttajaId,
                kiekkoId: kiekko.id,
                nimi: kiekko.name === "<- Tilt" ? "Tilt" : kiekko.name,
                valmistaja: kiekko.brand,
                kategoria: kiekko.category === "Disc Golf Sets" ? "Distance Driver" : kiekko.category,
                nopeus: kiekko.speed,
                liito: kiekko.glide,
                vakaus: kiekko.turn,
                feidi: kiekko.fade,
                kuva: kiekko.pic ?? null,
                stability: kiekko.stability_slug,
            },
        });
        // Debug: console.log("Suosikki lisätty.", suosikki);
        // Palautetaan lisäyksen jälkeen, tai annetaan virhe
        res.status(201).json(suosikki);
    }
    catch (error) {
        console.error("Virhe suosikin lisäämisessä:", error);
        res.status(500).json({ virhe: "Suosikin lisääminen epäonnistui." });
    }
});
// Suosikkien haku kayttajaId:llä
suosikitRouter.get("/:kayttajaId", async (req, res) => {
    const { kayttajaId } = req.params;
    try {
        // Haetaan suosikit tietokannasta
        const suosikit = await prisma.suosikki.findMany({
            where: { kayttajaId: Number(kayttajaId) }
        });
        // Palautetaan suosikit käyttäjälle, tai virheviesti
        res.json(suosikit);
    }
    catch (error) {
        console.error("Virhe suosikkien haussa:", error);
        res.status(500).json({ virhe: "Suosikkien haku epäonnistui." });
    }
});
// Kiekon poisto suosikeista
suosikitRouter.delete("/", async (req, res) => {
    const { id, kayttajaId } = req.query;
    if (!id || !kayttajaId) {
        // Tarkistetaan, että id ja kayttajaId on annettu
        return res.status(400).json({ virhe: "Puuttuvat tiedot: id tai kayttajaId." });
    }
    try {
        // Etsitään poistettava suosikki tietokannasta
        const suosikki = await prisma.suosikki.findUnique({
            where: { id: Number(id) },
        });
        // Jos ei löydy, virhe
        if (!suosikki) {
            return res.status(404).json({ virhe: "Suosikkia ei löytynyt." });
        }
        // Tarkistetaan, että suosikki kuuluu oikealle käyttäjälle
        if (suosikki.kayttajaId !== Number(kayttajaId)) {
            return res.status(403).json({ virhe: "Et voi poistaa toisen käyttäjän suosikeista." });
        }
        // Poistetaan suosikki tietokannasta
        await prisma.suosikki.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ viesti: "Suosikki poistettu onnistuneesti." });
        // Virhe, jos poisto ei onnistu
    }
    catch (error) {
        console.error("Virhe suosikin poistossa:", error);
        res.status(500).json({ virhe: "Suosikin poisto epäonnistui." });
    }
});
exports.default = suosikitRouter;
