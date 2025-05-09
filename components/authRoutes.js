"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const apiAuthRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Mahdollistetaan JSON-pyyntöjen käsittely
apiAuthRouter.use(express_1.default.json());
// Rekisteröinti
apiAuthRouter.post("/register", async (req, res) => {
    try {
        const { kayttajatunnus, salasana } = req.body;
        if (!kayttajatunnus || !salasana) {
            res.status(400).json({ virhe: "Käyttäjätunnus ja salasana ovat pakollisia" });
            return;
        }
        const existingUser = await prisma.kayttaja.findFirst({
            where: { kayttajatunnus }
        });
        if (existingUser) {
            res.status(400).json({ virhe: "Käyttäjätunnus on jo käytössä." });
            return;
        }
        const hashedPassword = crypto_1.default.createHash("SHA256").update(salasana).digest("hex");
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
// Kirjautuminen
apiAuthRouter.post("/login", async (req, res) => {
    try {
        const { kayttajatunnus, salasana } = req.body;
        if (!kayttajatunnus || !salasana) {
            res.status(400).json({ virhe: "Syötä käyttäjätunnus ja salasana." });
            return;
        }
        const kayttaja = await prisma.kayttaja.findFirst({
            where: { kayttajatunnus }
        });
        if (!kayttaja) {
            res.status(401).json({ virhe: "Virheellinen käyttäjätunnus." });
            return;
        }
        const hash = crypto_1.default.createHash("SHA256").update(salasana).digest("hex");
        if (hash !== kayttaja.salasana) {
            res.status(401).json({ virhe: "Virheellinen salasana." });
            return;
        }
        // Luodaan JWT-tunnus, joka palautetaan kirjautuneelle käyttäjälle
        const token = jsonwebtoken_1.default.sign({}, "ToinenSalausLause_25");
        res.status(200).json({
            message: 'Kirjautuminen onnistui.',
            token: token,
        });
    }
    catch (error) {
        console.error("Virhe kirjautumisessa:", error);
        res.status(500).json({ virhe: "Palvelinvirhe" });
    }
});
exports.default = apiAuthRouter;
