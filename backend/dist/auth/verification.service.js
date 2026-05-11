"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
let VerificationService = class VerificationService {
    async verifyIdentity(idImage, selfieImage) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const randomScore = Math.random() * (0.99 - 0.85) + 0.85;
        const isMatched = randomScore > 0.8;
        return {
            success: isMatched,
            score: parseFloat(randomScore.toFixed(4)),
            idType: this.determineIdType(idImage),
            extractedName: 'John Doe',
        };
    }
    determineIdType(filename) {
        if (filename.toLowerCase().includes('passport'))
            return 'PASSPORT';
        if (filename.toLowerCase().includes('aadhar'))
            return 'AADHAR';
        if (filename.toLowerCase().includes('license'))
            return 'DRIVING_LICENSE';
        return 'GOVERNMENT_ID';
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)()
], VerificationService);
//# sourceMappingURL=verification.service.js.map