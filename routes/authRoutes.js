"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const authRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Mahdollistetaan JSON-pyyntöjen käsittely
authRouter.use(express_1.default.json());
// Rekisteröinti
authRouter.post("/register", async (req, res) => {
    try {
        // Haetaan pyynnöstä tiedot
        const { kayttajatunnus, salasana } = req.body;
        // Tarkastetaan, että kayttajatunnus ja salasana on annettu
        if (!kayttajatunnus || !salasana) {
            res.status(400).json({ virhe: "Syötä käyttäjätunnus ja salasana." });
            return;
        }
        // Tarkastetaan, onko käyttäjätunnus jo olemassa
        const existingUser = await prisma.kayttaja.findFirst({
            where: { kayttajatunnus }
        });
        // Jos kyllä, virhe
        if (existingUser) {
            res.status(400).json({ virhe: "Käyttäjätunnus käytössä." });
            return;
        }
        // Salasanan hashays
        const hashedPassword = crypto_1.default.createHash("SHA256").update(salasana).digest("hex");
        // Käyttäjän luonti tietokantaan, ja ilmoitus onnistumisesta tai virheestä
        await prisma.kayttaja.create({
            data: {
                kayttajatunnus,
                salasana: hashedPassword
            }
        });
        res.status(201).json({ viesti: "Rekisteröinti onnistui." });
    }
    catch (error) {
        console.error("Virhe rekisteröinnissä:", error);
        res.status(500).json({ virhe: "Palvelinvirhe" });
    }
});
// Kaikkien käyttäjien haku
authRouter.get("/kayttajat", async (req, res) => {
    try {
        // Haetaan kaikki käyttäjätunnukset ja käyttäjien ID:t
        const kayttajat = await prisma.kayttaja.findMany({
            select: {
                id: true,
                kayttajatunnus: true,
            }
        });
        // Palautetaan käyttäjät, tai annetaan virhe
        res.status(200).json(kayttajat);
    }
    catch (error) {
        console.error("Virhe käyttäjien haussa:", error);
        res.status(500).json({ virhe: "Käyttäjien haku epäonnistui." });
    }
});
// Kirjautuminen
authRouter.post("/login", async (req, res) => {
    try {
        // Haetaan pyynnöstä tiedot
        const { kayttajatunnus, salasana } = req.body;
        // Tarkastetaan, että käyttäjätunnus ja salasana on annettu
        if (!kayttajatunnus || !salasana) {
            res.status(400).json({ virhe: "Syötä käyttäjätunnus ja salasana." });
            return;
        }
        // Haetaan käyttäjätunnus tietokannasta
        const kayttaja = await prisma.kayttaja.findFirst({
            where: { kayttajatunnus }
        });
        // Jos tunnusta ei löydy, virhe
        if (!kayttaja) {
            res.status(401).json({ virhe: "Virheellinen käyttäjätunnus." });
            return;
        }
        // Verrataan salasanan hashays
        const hash = crypto_1.default.createHash("SHA256").update(salasana).digest("hex");
        // Virhe, jos hashays ei täsmää
        if (hash !== kayttaja.salasana) {
            res.status(401).json({ virhe: "Virheellinen salasana." });
            return;
        }
        // Luodaan JWT-tunnus, ja lisätään siihen käyttäjän ID
        const token = jsonwebtoken_1.default.sign({ id: kayttaja.id }, // Käyttäjän ID
        "ToinenSalausLause_25" // Salausavain
        );
        // Debug: Tulostetaan luotu token ja dekoodattu sisältö
        // console.log("Luotu token:", token);
        // const decodedToken = jwt.decode(token);
        // console.log("Decoded token:", decodedToken)
        // Viesti jos kirjautuminen onnistuu ja tokenin näyttö
        res.status(200).json({
            message: 'Kirjautuminen onnistui.',
            token: token,
        });
        //Virhe jos kirjautuminen ei onnistu
    }
    catch (error) {
        console.error("Virhe kirjautumisessa:", error);
        res.status(500).json({ virhe: "Palvelinvirhe" });
    }
});
// Tokenin vahvistus
authRouter.get('/validate-token', (req, res) => {
    // Haetaan authorization-headeri, "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // Virhe jos token puuttuu
    if (!token) {
        return res.status(401).json({ virhe: 'Token puuttuu' });
    }
    try {
        // Verifioidaan token salausavaimella
        const decoded = jsonwebtoken_1.default.verify(token, 'ToinenSalausLause_25');
        // Debug: console.log('Token vahvistettu:', decoded);
        res.status(200).json({ viesti: 'Token on voimassa', kayttaja: decoded });
        // Virhe, jos vanhentunut tai vikaa
    }
    catch (err) {
        console.error('Token ei kelpaa:', err);
        res.status(401).json({ virhe: 'Virheellinen tai vanhentunut token' });
    }
});
exports.default = authRouter;
