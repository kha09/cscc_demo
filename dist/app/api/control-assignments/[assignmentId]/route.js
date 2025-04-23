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
import { Prisma, TaskStatus, ComplianceLevel } from '@prisma/client'; // Import ComplianceLevel enum
// Zod schema for validating the PATCH request body
var updateControlAssignmentSchema = z.object({
    assignedUserId: z.string().uuid({ message: "Invalid Assigned User ID" }).nullable().optional(), // Allow assigning/unassigning, make optional
    status: z.nativeEnum(TaskStatus).optional(), // Allow updating status
    notes: z.string().optional().nullable(), // الملاحظات
    correctiveActions: z.string().optional().nullable(), // إجراءات التصحيح
    expectedComplianceDate: z.string().datetime({ message: "Invalid date format for expected compliance date" }).optional().nullable(), // تاريخ الالتزام المتوقع (string from client)
    complianceLevel: z.nativeEnum(ComplianceLevel).optional().nullable(), // مستوى الالتزام
});
// PATCH handler to update a specific ControlAssignment
export function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var assignmentId, body, validation, _c, assignedUserId, status_1, notes, correctiveActions, expectedComplianceDate, complianceLevel, existingAssignment, userExists, updateData, updatedAssignment, error_1;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 6, , 7]);
                    assignmentId = params.assignmentId;
                    // Validate assignmentId format
                    if (!z.string().uuid().safeParse(assignmentId).success) {
                        return [2 /*return*/, NextResponse.json({ message: "Invalid Control Assignment ID format" }, { status: 400 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _d.sent();
                    validation = updateControlAssignmentSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 })];
                    }
                    _c = validation.data, assignedUserId = _c.assignedUserId, status_1 = _c.status, notes = _c.notes, correctiveActions = _c.correctiveActions, expectedComplianceDate = _c.expectedComplianceDate, complianceLevel = _c.complianceLevel;
                    return [4 /*yield*/, prisma.controlAssignment.findUnique({
                            where: { id: assignmentId },
                            include: {
                                task: {
                                    select: { assignedToId: true }
                                }
                            }
                        })];
                case 2:
                    existingAssignment = _d.sent();
                    if (!existingAssignment) {
                        return [2 /*return*/, NextResponse.json({ message: "Control Assignment not found" }, { status: 404 })];
                    }
                    if (!assignedUserId) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { id: assignedUserId },
                            select: { department: true } // Select department to potentially check against manager's department
                        })];
                case 3:
                    userExists = _d.sent();
                    if (!userExists) {
                        return [2 /*return*/, NextResponse.json({ message: "Assigned user not found" }, { status: 404 })];
                    }
                    _d.label = 4;
                case 4:
                    updateData = {};
                    // Handle assignedUserId update
                    if ('assignedUserId' in body) { // Check if the key exists in the original body
                        if (assignedUserId === null) {
                            updateData.assignedUser = { disconnect: true };
                        }
                        else if (assignedUserId) {
                            // Connect the user if a valid ID is passed
                            updateData.assignedUser = { connect: { id: assignedUserId } };
                        }
                        // If assignedUserId is undefined in validation.data but was in body, it means it wasn't provided or was invalid - do nothing
                    }
                    // Handle other fields
                    if (status_1 !== undefined) {
                        updateData.status = status_1;
                    }
                    if (notes !== undefined) {
                        updateData.notes = notes;
                    }
                    if (correctiveActions !== undefined) {
                        updateData.correctiveActions = correctiveActions;
                    }
                    if (expectedComplianceDate !== undefined) {
                        // Convert string date to Date object, or null if null was passed
                        updateData.expectedComplianceDate = expectedComplianceDate ? new Date(expectedComplianceDate) : null;
                    }
                    if (complianceLevel !== undefined) {
                        updateData.complianceLevel = complianceLevel;
                    }
                    // Check if there's anything to update
                    if (Object.keys(updateData).length === 0) {
                        return [2 /*return*/, NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 })];
                    }
                    return [4 /*yield*/, prisma.controlAssignment.update({
                            where: { id: assignmentId },
                            data: updateData,
                            include: {
                                control: true,
                                assignedUser: { select: { id: true, name: true, nameAr: true } }
                            }
                        })];
                case 5:
                    updatedAssignment = _d.sent();
                    return [2 /*return*/, NextResponse.json(updatedAssignment, { status: 200 })];
                case 6:
                    error_1 = _d.sent();
                    console.error("Error updating control assignment:", error_1);
                    if (error_1 instanceof z.ZodError) {
                        return [2 /*return*/, NextResponse.json({ message: "Validation failed", errors: error_1.errors }, { status: 400 })];
                    }
                    // Handle potential Prisma errors (e.g., foreign key constraint if user doesn't exist)
                    if (error_1 instanceof Prisma.PrismaClientKnownRequestError) {
                        // Example: Foreign key constraint failed
                        if (error_1.code === 'P2003') {
                            return [2 /*return*/, NextResponse.json({ message: "Invalid assigned user ID provided." }, { status: 400 })];
                        }
                    }
                    return [2 /*return*/, NextResponse.json({ message: "Internal Server Error" }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
