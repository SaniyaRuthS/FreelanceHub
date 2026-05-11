"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GigsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gigs_service_1 = require("./gigs.service");
const gigs_dto_1 = require("./dto/gigs.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let GigsController = class GigsController {
    constructor(gigsService) {
        this.gigsService = gigsService;
    }
    findAll(filter) {
        return this.gigsService.findAll(filter);
    }
    suggest(query) {
        return this.gigsService.getSuggestions(query);
    }
    findOne(id) {
        return this.gigsService.findOne(id);
    }
    create(req, dto) {
        return this.gigsService.create(req.user.id, dto);
    }
};
exports.GigsController = GigsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all gigs with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [gigs_dto_1.GetGigsFilterDto]),
    __metadata("design:returntype", void 0)
], GigsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('suggest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get search suggestions (autocomplete)' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GigsController.prototype, "suggest", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single gig by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GigsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new gig (Sellers only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gigs_dto_1.CreateGigDto]),
    __metadata("design:returntype", void 0)
], GigsController.prototype, "create", null);
exports.GigsController = GigsController = __decorate([
    (0, swagger_1.ApiTags)('gigs'),
    (0, common_1.Controller)('api/gigs'),
    __metadata("design:paramtypes", [gigs_service_1.GigsService])
], GigsController);
//# sourceMappingURL=gigs.controller.js.map