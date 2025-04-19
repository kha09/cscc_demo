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
import { z } from 'zod'; // For input validation
import { Role } from '@prisma/client';
// Define schema for validation
var userUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    nameAr: z.string().optional().nullable(),
    email: z.string().email("Invalid email address").optional(),
    role: z.nativeEnum(Role).optional(),
    department: z.string().optional().nullable(),
    // Add other fields that can be updated, e.g., mobile, phone
    // Password updates should likely be handled separately for security
});
// PUT handler for updating a user
export function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var userId, body, validation, existingUser, updatedUser, error_1;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    userId = params.userId;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _c.sent();
                    validation = userUpdateSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, NextResponse.json({ message: "Invalid input", errors: validation.error.errors }, { status: 400 })];
                    }
                    if (!validation.data.email) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.user.findUnique({ where: { email: validation.data.email } })];
                case 3:
                    existingUser = _c.sent();
                    if (existingUser && existingUser.id !== userId) {
                        return [2 /*return*/, NextResponse.json({ message: 'Email already in use by another account' }, { status: 409 })]; // Conflict
                    }
                    _c.label = 4;
                case 4: return [4 /*yield*/, prisma.user.update({
                        where: { id: userId },
                        data: validation.data, // Use validated data
                    })];
                case 5:
                    updatedUser = _c.sent();
                    return [2 /*return*/, NextResponse.json(updatedUser)];
                case 6:
                    error_1 = _c.sent();
                    console.error("Failed to update user ".concat(userId, ":"), error_1);
                    // Check for specific Prisma errors, e.g., record not found
                    if (error_1.code === 'P2025') {
                        return [2 /*return*/, NextResponse.json({ message: 'User not found' }, { status: 404 })];
                    }
                    return [2 /*return*/, NextResponse.json({ message: 'Internal Server Error: Failed to update user' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// DELETE handler for deleting a user
export function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var userId, error_2;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    userId = params.userId;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    // Optional: Check if user exists before attempting delete
                    // const userExists = await prisma.user.findUnique({ where: { id: userId } });
                    // if (!userExists) {
                    //   return NextResponse.json({ message: 'User not found' }, { status: 404 });
                    // }
                    return [4 /*yield*/, prisma.user.delete({
                            where: { id: userId },
                        })];
                case 2:
                    // Optional: Check if user exists before attempting delete
                    // const userExists = await prisma.user.findUnique({ where: { id: userId } });
                    // if (!userExists) {
                    //   return NextResponse.json({ message: 'User not found' }, { status: 404 });
                    // }
                    _c.sent();
                    return [2 /*return*/, NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })]; // Or 204 No Content
                case 3:
                    error_2 = _c.sent();
                    console.error("Failed to delete user ".concat(userId, ":"), error_2);
                    // Check for specific Prisma errors, e.g., record not found
                    if (error_2.code === 'P2025') {
                        return [2 /*return*/, NextResponse.json({ message: 'User not found' }, { status: 404 })];
                    }
                    // Handle potential foreign key constraint errors if user is linked elsewhere
                    if (error_2.code === 'P2003') {
                        return [2 /*return*/, NextResponse.json({ message: 'Cannot delete user: They are linked to other records (e.g., assessments).' }, { status: 409 })]; // Conflict
                    }
                    return [2 /*return*/, NextResponse.json({ message: 'Internal Server Error: Failed to delete user' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
