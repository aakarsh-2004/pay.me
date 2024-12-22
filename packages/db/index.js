"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnRampStatus = void 0;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "OnRampStatus", { enumerable: true, get: function () { return client_1.OnRampStatus; } });
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
const prisma = (_a = globalThis.prismaGlobal) !== null && _a !== void 0 ? _a : prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
