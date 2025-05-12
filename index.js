"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const kiekotRoutes_1 = __importDefault(require("./routes/kiekotRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const suosikitRoutes_1 = __importDefault(require("./routes/suosikitRoutes"));
const app = (0, express_1.default)();
const portti = Number(process.env.PORT) || 3110;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'https://kiekkoselain.onrender.com'],
    credentials: true
}));
// Reititykset
app.use('/api', kiekotRoutes_1.default); // /api/kiekot
app.use('/auth', authRoutes_1.default); // /auth/login, /auth/register
app.use('/api/suosikit', suosikitRoutes_1.default); // /api/suosikit
// Käynnistetään palvelin
app.listen(portti, () => {
    console.log(`Palvelin käynnistettiin osoitteeseen http://localhost:${portti}`);
});
