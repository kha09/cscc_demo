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
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
// GET handler to fetch control assignments, filtered by assignedUserId
export function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, userId, assignments, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    searchParams = new URL(request.url).searchParams;
                    userId = searchParams.get('userId');
                    // Validate userId
                    if (!userId) {
                        return [2 /*return*/, NextResponse.json({ message: "User ID query parameter is required" }, { status: 400 })];
                    }
                    if (!z.string().uuid().safeParse(userId).success) {
                        return [2 /*return*/, NextResponse.json({ message: "Invalid User ID format" }, { status: 400 })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma.controlAssignment.findMany({
                            where: {
                                assignedUserId: userId,
                            },
                            include: {
                                control: {
                                    select: {
                                        id: true,
                                        controlNumber: true,
                                        controlText: true,
                                        mainComponent: true,
                                        subComponent: true,
                                        controlType: true,
                                    }
                                },
                                task: {
                                    select: {
                                        id: true,
                                        deadline: true,
                                        status: true, // Include task status if needed, though assignment status might be more relevant
                                        sensitiveSystem: {
                                            select: {
                                                systemName: true,
                                            }
                                        }
                                    }
                                }
                                // We don't need to include assignedUser here as it's implicitly the user making the request
                            },
                            orderBy: {
                                // Optional: Order by task deadline or control number
                                task: {
                                    deadline: 'asc',
                                }
                            }
                        })];
                case 2:
                    assignments = _a.sent();
                    return [2 /*return*/, NextResponse.json(assignments)];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error fetching control assignments:", error_1);
                    // Handle potential Prisma errors or other unexpected errors
                    if (error_1 instanceof Prisma.PrismaClientKnownRequestError) {
                        // Handle specific Prisma errors if necessary
                        console.error("Prisma Error Code:", error_1.code);
                    }
                    return [2 /*return*/, NextResponse.json({ message: "Internal Server Error" }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
