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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { NextResponse } from 'next/server'; // Import NextRequest
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role, Prisma } from '@prisma/client'; // Import Role enum and Prisma for types
// GET handler to fetch users with filtering
export function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, department, roleParam, unassigned, whereClause, users, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    searchParams = new URL(request.url).searchParams;
                    department = searchParams.get('department');
                    roleParam = searchParams.get('role');
                    unassigned = searchParams.get('unassigned');
                    whereClause = {};
                    if (department) {
                        whereClause.department = department;
                    }
                    if (roleParam && Object.values(Role).includes(roleParam)) {
                        whereClause.role = roleParam;
                    }
                    if (unassigned === 'true') {
                        // If unassigned=true is requested, filter for users with department set to null
                        // This overrides any specific department filter if both are present (adjust logic if needed)
                        whereClause.department = null;
                    }
                    else if (department) {
                        // Only apply department filter if unassigned is not 'true'
                        whereClause.department = department;
                    }
                    return [4 /*yield*/, prisma.user.findMany({
                            where: whereClause,
                            // Select only necessary fields to avoid sending sensitive data like password
                            select: {
                                id: true,
                                name: true,
                                nameAr: true,
                                email: true,
                                role: true,
                                department: true,
                                createdAt: true,
                                updatedAt: true,
                                // Explicitly exclude password
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                case 1:
                    users = _a.sent();
                    return [2 /*return*/, NextResponse.json(users)];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to fetch users:', error_1);
                    return [2 /*return*/, NextResponse.json({ message: 'Internal Server Error: Failed to fetch users' }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// POST handler to create a new user
export function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, name_1, nameAr, email, password, role, department, existingUser, hashedPassword, newUser, _, userWithoutPassword, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    name_1 = body.name, nameAr = body.nameAr, email = body.email, password = body.password, role = body.role, department = body.department;
                    // Basic validation
                    if (!name_1 || !email || !password || !role) {
                        return [2 /*return*/, NextResponse.json({ message: 'Missing required fields (name, email, password, role)' }, { status: 400 })];
                    }
                    // Validate Role
                    if (!Object.values(Role).includes(role)) {
                        return [2 /*return*/, NextResponse.json({ message: 'Invalid role specified' }, { status: 400 })];
                    }
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: email },
                        })];
                case 2:
                    existingUser = _c.sent();
                    if (existingUser) {
                        return [2 /*return*/, NextResponse.json({ message: 'User with this email already exists' }, { status: 409 })]; // 409 Conflict
                    }
                    return [4 /*yield*/, bcrypt.hash(password, 10)];
                case 3:
                    hashedPassword = _c.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: name_1,
                                nameAr: nameAr || null, // Handle optional field
                                email: email,
                                password: hashedPassword,
                                role: role, // Use the validated role
                                department: department || null, // Handle optional field
                                // Add default values for other fields if necessary based on your schema
                            },
                        })];
                case 4:
                    newUser = _c.sent();
                    _ = newUser.password, userWithoutPassword = __rest(newUser, ["password"]);
                    return [2 /*return*/, NextResponse.json(userWithoutPassword, { status: 201 })]; // 201 Created
                case 5:
                    error_2 = _c.sent();
                    console.error('Failed to create user:', error_2);
                    // Handle potential Prisma errors, e.g., unique constraint violation (though checked above)
                    // Add type check for PrismaClientKnownRequestError
                    if (error_2 instanceof Prisma.PrismaClientKnownRequestError && error_2.code === 'P2002' && ((_b = (_a = error_2.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('email'))) {
                        return [2 /*return*/, NextResponse.json({ message: 'User with this email already exists' }, { status: 409 })];
                    }
                    return [2 /*return*/, NextResponse.json({ message: 'Internal Server Error: Failed to create user' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
