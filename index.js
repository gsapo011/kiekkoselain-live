"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const kiekotRoutes_1 = __importDefault(require("./components/kiekotRoutes"));
const authRoutes_1 = __importDefault(require("./components/authRoutes"));
const app = (0, express_1.default)();
const portti = Number(process.env.PORT) || 3110;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Reititykset
app.use('/api', kiekotRoutes_1.default); // /api/kiekot
app.use('/auth', authRoutes_1.default); // /auth/login, /auth/register
// Käynnistetään palvelin
app.listen(portti, () => {
    console.log(`Palvelin käynnistettiin osoitteeseen http://localhost:${portti}`);
});
