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
import { prisma } from '@/lib/prisma'; // Use named import
import { z } from 'zod';
// Zod schema for validation
var updateAssessmentSchema = z.object({
    assessmentName: z.string().min(1, "Assessment name cannot be empty"),
    // Add other fields that might be updatable via PATCH later
});
export function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var assessmentId, body, validation, assessmentName, existingAssessment, updatedAssessment, error_1;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    assessmentId = params.assessmentId;
                    if (!assessmentId) {
                        return [2 /*return*/, NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _c.sent();
                    validation = updateAssessmentSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 })];
                    }
                    assessmentName = validation.data.assessmentName;
                    return [4 /*yield*/, prisma.assessment.findUnique({
                            where: { id: assessmentId },
                        })];
                case 3:
                    existingAssessment = _c.sent();
                    if (!existingAssessment) {
                        return [2 /*return*/, NextResponse.json({ error: 'Assessment not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, prisma.assessment.update({
                            where: { id: assessmentId },
                            data: {
                                assessmentName: assessmentName,
                                // Add other fields from validation.data if they exist
                            },
                        })];
                case 4:
                    updatedAssessment = _c.sent();
                    return [2 /*return*/, NextResponse.json(updatedAssessment, { status: 200 })];
                case 5:
                    error_1 = _c.sent();
                    console.error('Error updating assessment:', error_1);
                    // Handle potential JSON parsing errors
                    if (error_1 instanceof SyntaxError) {
                        return [2 /*return*/, NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 })];
                    }
                    return [2 /*return*/, NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Optional: Add GET handler if needed to fetch a single assessment by ID
export function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var assessmentId, assessment, error_2;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    assessmentId = params.assessmentId;
                    if (!assessmentId) {
                        return [2 /*return*/, NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma.assessment.findUnique({
                            where: { id: assessmentId },
                            // Include related data if necessary
                            // include: { sensitiveSystems: true }
                        })];
                case 2:
                    assessment = _c.sent();
                    if (!assessment) {
                        return [2 /*return*/, NextResponse.json({ error: 'Assessment not found' }, { status: 404 })];
                    }
                    return [2 /*return*/, NextResponse.json(assessment, { status: 200 })];
                case 3:
                    error_2 = _c.sent();
                    console.error('Error fetching assessment:', error_2);
                    return [2 /*return*/, NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Optional: Add DELETE handler if needed
// export async function DELETE(...) { ... }
