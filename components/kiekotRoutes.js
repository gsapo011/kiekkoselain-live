"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = (0, express_1.Router)();
const URL = 'https://discit-api.fly.dev/disc';
// Muuntaa merkkijonon URL-ystävälliseen muotoon
const muodostaSlug = (str) => str.toLowerCase().replace(/\s+/g, '-');
// Virheellisen kategorian korjaus
const normalisoiKategoria = (kategoria) => {
    if (kategoria === 'Disc Golf Sets')
        return 'Distance Driver';
    return kategoria;
};
// Kiekkojen haku. Suodatus onnistuu valmistajalla, kategorialla sekä lento-ominaisuuksilla
router.get('/kiekot', async (req, res) => {
    const { valmistaja, kategoria, nopeus, liito, vakaus, feidi, nimi } = req.query;
    try {
        const response = await (0, node_fetch_1.default)(URL);
        const kaikkiKiekot = (await response.json());
        // Korjataan kiekkojen nimiä
        const korjatutKiekot = kaikkiKiekot.map((kiekko) => {
            kiekko.name = kiekko.name.replace(/<-/, ''); // Poistaa "<-" merkin nimestä, lisää muita merkkejä tarvittaessa
            return kiekko;
        });
        // Suodatetaan kiekot hakuehdoilla
        const suodatetut = korjatutKiekot.filter((kiekko) => {
            // Tarkistetaan valmistajan täsmäävyys
            const valmistajaOsumat = !valmistaja ||
                kiekko.brand_slug === muodostaSlug(String(valmistaja)) ||
                kiekko.brand === String(valmistaja);
            // Tarkistetaan kategorian täsmäävyys
            const kategoriaOsumat = !kategoria ||
                muodostaSlug(normalisoiKategoria(kiekko.category)) === muodostaSlug(String(kategoria));
            // Tarkistetaan ominaisuuksien täsmäävyys
            const nopeusOsumat = !nopeus || kiekko.speed === nopeus;
            const liitoOsumat = !liito || kiekko.glide === liito;
            const vakausOsumat = !vakaus || kiekko.turn === vakaus;
            const feidiOsumat = !feidi || kiekko.fade === feidi;
            // Tarkistetaan nimen täsmäävyys
            const nimiOsumat = !nimi ||
                kiekko.name.toLowerCase().replace(/\s+/g, '-') === muodostaSlug(String(nimi)) ||
                kiekko.name.toLowerCase() === String(nimi).toLowerCase();
            // True, jos suodattimet täsmäävät
            return (valmistajaOsumat &&
                kategoriaOsumat &&
                nopeusOsumat &&
                liitoOsumat &&
                vakausOsumat &&
                feidiOsumat &&
                nimiOsumat);
        });
        // Palautetaan tietokentät
        const suodatetutKiekot = suodatetut.map((kiekko) => ({
            nimi: kiekko.name,
            valmistaja: kiekko.brand,
            kategoria: normalisoiKategoria(kiekko.category),
            stability: kiekko.stability_slug,
            nopeus: kiekko.speed,
            liito: kiekko.glide,
            vakaus: kiekko.turn,
            feidi: kiekko.fade,
            kuva: kiekko.pic,
        }));
        res.json(suodatetutKiekot);
    }
    catch (error) {
        console.error('Virhe tietojen haussa:', error);
        res.status(500).json({ virhe: 'Tietojen haku epäonnistui.' });
    }
});
// Valmistajien haku (näyttää vain valmistajat)
router.get('/kiekot/valmistajat', async (_req, res) => {
    try {
        const response = await (0, node_fetch_1.default)(URL);
        const kaikkiKiekot = (await response.json());
        // Luodaan set, jotta saadaan vain uniikit valmistajat
        const valmistajat = new Set(kaikkiKiekot.map((kiekko) => kiekko.brand));
        // Palautetaan valmistajat taulukossa
        res.json(Array.from(valmistajat));
    }
    catch (error) {
        console.error('Virhe valmistajien haussa:', error);
        res.status(500).json({ virhe: 'Valmistajien haku epäonnistui.' });
    }
});
// Haku kiekon nimen perusteella, löytää kiekot osittaisilla nimillä
router.get('/kiekot/nimi', async (req, res) => {
    const { nimi } = req.query;
    try {
        const response = await (0, node_fetch_1.default)(URL);
        const kaikkiKiekot = (await response.json());
        // Tarkistetaan, että nimen haku toimii osittaisella vertailulla
        const tulos = nimi
            ? kaikkiKiekot.filter((kiekko) => {
                const nameSlug = kiekko.name.toLowerCase().replace(/\s+/g, '-'); // Muutetaan nimi slug-muotoon
                const nameSearch = String(nimi).toLowerCase(); // Haettava nimi
                const regExp = new RegExp(nameSearch, 'i'); // Luo säännöllinen lauseke (case-insensitive)
                // Tarkistetaan, löytyykö hakusana nimestä tai slugista
                return regExp.test(kiekko.name.toLowerCase()) || regExp.test(nameSlug);
            })
            : [];
        // Palautetaan tietokentät
        const tulosKiekot = tulos.map((kiekko) => ({
            nimi: kiekko.name,
            valmistaja: kiekko.brand,
            nopeus: kiekko.speed,
            liito: kiekko.glide,
            vakaus: kiekko.turn,
            feidi: kiekko.fade,
            kuva: kiekko.pic,
        }));
        res.json(tulosKiekot);
    }
    catch (error) {
        console.error('Virhe nimen haussa:', error);
        res.status(500).json({ virhe: 'Nimen mukaisten kiekkojen haku epäonnistui.' });
    }
});
exports.default = router;
