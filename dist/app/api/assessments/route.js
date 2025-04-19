var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdirSync, existsSync } from 'fs'; // For creating directory if needed
// Ensure the upload directory exists
var uploadDir = path.join(process.cwd(), 'public/uploads/logos');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}
export function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var formData, companyNameAr, companyNameEn, securityManagerId, secondaryContactNameAr, secondaryContactNameEn, secondaryContactMobile, secondaryContactPhone, secondaryContactEmail, logoFile, adminUser, adminUserId, logoPath, bytes, buffer, filename, filePath, uploadError_1, newAssessment, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, request.formData()];
                case 1:
                    formData = _a.sent();
                    companyNameAr = formData.get('companyNameAr');
                    companyNameEn = formData.get('companyNameEn');
                    securityManagerId = formData.get('securityManagerId');
                    secondaryContactNameAr = formData.get('secondaryContactNameAr');
                    secondaryContactNameEn = formData.get('secondaryContactNameEn');
                    secondaryContactMobile = formData.get('secondaryContactMobile');
                    secondaryContactPhone = formData.get('secondaryContactPhone');
                    secondaryContactEmail = formData.get('secondaryContactEmail');
                    logoFile = formData.get('logo');
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { role: 'ADMIN' }, // Assuming Role enum is imported or use 'ADMIN' string
                            select: { id: true },
                        })];
                case 2:
                    adminUser = _a.sent();
                    if (!adminUser) {
                        console.error('No ADMIN user found in the database.');
                        return [2 /*return*/, NextResponse.json({ message: 'Admin user not found to create assessment' }, { status: 500 })];
                    }
                    adminUserId = adminUser.id;
                    // --- End Temporary Fix ---
                    // Basic Validation
                    if (!companyNameAr || !companyNameEn || !securityManagerId || !secondaryContactEmail) { // Removed adminUserId check as it's fetched above
                        return [2 /*return*/, NextResponse.json({ message: 'Missing required fields' }, { status: 400 })];
                    }
                    logoPath = null;
                    if (!logoFile) return [3 /*break*/, 7];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, logoFile.arrayBuffer()];
                case 4:
                    bytes = _a.sent();
                    buffer = Buffer.from(bytes);
                    filename = "".concat(Date.now(), "-").concat(logoFile.name.replace(/\s+/g, '_'));
                    filePath = path.join(uploadDir, filename);
                    return [4 /*yield*/, writeFile(filePath, buffer)];
                case 5:
                    _a.sent();
                    logoPath = "/uploads/logos/".concat(filename); // Store the relative path accessible via web server
                    console.log("Logo uploaded to: ".concat(filePath));
                    return [3 /*break*/, 7];
                case 6:
                    uploadError_1 = _a.sent();
                    console.error('Logo upload failed:', uploadError_1);
                    return [3 /*break*/, 7];
                case 7: return [4 /*yield*/, prisma.assessment.create({
                        data: {
                            companyNameAr: companyNameAr,
                            companyNameEn: companyNameEn,
                            logoPath: logoPath, // Use the saved path or null
                            securityManagerId: securityManagerId,
                            secondaryContactNameAr: secondaryContactNameAr,
                            secondaryContactNameEn: secondaryContactNameEn,
                            secondaryContactMobile: secondaryContactMobile,
                            secondaryContactPhone: secondaryContactPhone,
                            secondaryContactEmail: secondaryContactEmail,
                            createdById: adminUserId, // Link to the admin who created it
                        },
                    })];
                case 8:
                    newAssessment = _a.sent();
                    return [2 /*return*/, NextResponse.json(newAssessment, { status: 201 })];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error creating assessment:', error_1);
                    // Check for specific Prisma errors if needed
                    return [2 /*return*/, NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
