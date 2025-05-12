"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const kiekotRoutes_1 = __importDefault(require("./routes/kiekotRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const suosikitRoutes_1 = __importDefault(require("./routes/suosikitRoutes"));
const app = (0, express_1.default)();
const portti = Number(process.env.PORT) || 3110;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Palvele staattiset tiedostot (buildattu React-sovellus)
app.use(express_1.default.static(path_1.default.resolve(__dirname, 'public')));
// API-reitit
app.use('/api', kiekotRoutes_1.default); // esim. /api/kiekot
app.use('/auth', authRoutes_1.default); // esim. /auth/login
app.use('/api/suosikit', suosikitRoutes_1.default); // esim. /api/suosikit
// Palauta index.html kaikille muille reiteille (Reactin client-reitit)
app.get('*', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, 'public', 'index.html'));
});
// Käynnistä palvelin
app.listen(portti, () => {
    console.log(`Palvelin käynnistettiin osoitteeseen http://localhost:${portti}`);
});
