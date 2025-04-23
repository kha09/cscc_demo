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
// Zod schema for validating the POST request body
var createTaskSchema = z.object({
    sensitiveSystemId: z.string().uuid({ message: "Invalid Sensitive System ID" }),
    // departmentId: z.string().uuid({ message: "Invalid Department ID" }), // Removed
    assignedToId: z.string().uuid({ message: "Invalid Assigned To User ID (Department Manager)" }), // Added
    controlIds: z.array(z.string().uuid({ message: "Invalid Control ID in array" })).min(1, { message: "At least one control must be selected" }),
    deadline: z.string().datetime({ message: "Invalid deadline date format" }),
    assignedById: z.string().uuid({ message: "Invalid Assigned By User ID (Security Manager)" }), // Assuming this comes from authenticated session later
});
export function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, validation, _a, sensitiveSystemId, assignedToId, controlIds, deadline, assignedById, _b, systemExists, assigneeExists, controlsExist, assignerExists, foundIds_1, missingIds, newTask_1, assignmentError_1, finalTask, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    validation = createTaskSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 })];
                    }
                    _a = validation.data, sensitiveSystemId = _a.sensitiveSystemId, assignedToId = _a.assignedToId, controlIds = _a.controlIds, deadline = _a.deadline, assignedById = _a.assignedById;
                    return [4 /*yield*/, Promise.all([
                            prisma.sensitiveSystemInfo.findUnique({ where: { id: sensitiveSystemId } }),
                            // prisma.department.findUnique({ where: { id: departmentId } }), // Removed department check
                            prisma.user.findUnique({ where: { id: assignedToId, role: 'DEPARTMENT_MANAGER' } }), // Check if assignee is a Department Manager
                            prisma.control.findMany({ where: { id: { in: controlIds } } }),
                            prisma.user.findUnique({ where: { id: assignedById, role: 'SECURITY_MANAGER' } }) // Ensure assigner is a Security Manager
                        ])];
                case 2:
                    _b = _c.sent(), systemExists = _b[0], assigneeExists = _b[1], controlsExist = _b[2], assignerExists = _b[3];
                    if (!systemExists) {
                        return [2 /*return*/, NextResponse.json({ message: "Sensitive System not found" }, { status: 404 })];
                    }
                    // if (!departmentExists) { // Removed department check
                    //   return NextResponse.json({ message: "Department not found" }, { status: 404 });
                    // }
                    if (!assigneeExists) { // Added assignee check
                        return [2 /*return*/, NextResponse.json({ message: "Assigned user (Department Manager) not found or does not have the correct role" }, { status: 404 })];
                    }
                    if (controlsExist.length !== controlIds.length) {
                        foundIds_1 = controlsExist.map(function (c) { return c.id; });
                        missingIds = controlIds.filter(function (id) { return !foundIds_1.includes(id); });
                        return [2 /*return*/, NextResponse.json({ message: "One or more Controls not found: ".concat(missingIds.join(', ')) }, { status: 404 })];
                    }
                    if (!assignerExists) {
                        return [2 /*return*/, NextResponse.json({ message: "Assigning user not found or is not a Security Manager" }, { status: 404 })];
                    }
                    return [4 /*yield*/, prisma.task.create({
                            data: {
                                deadline: new Date(deadline),
                                sensitiveSystemId: sensitiveSystemId,
                                assignedToId: assignedToId,
                                assignedById: assignedById,
                                status: 'PENDING',
                            },
                        })];
                case 3:
                    newTask_1 = _c.sent();
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, Promise.all(controlIds.map(function (controlId) {
                            return prisma.controlAssignment.create({
                                data: {
                                    taskId: newTask_1.id,
                                    controlId: controlId,
                                    status: 'PENDING',
                                    // assignedUserId remains null initially
                                }
                            });
                        }))];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    assignmentError_1 = _c.sent();
                    console.error("Error creating control assignments after task creation:", assignmentError_1);
                    // Optionally, try to delete the created task for cleanup, though this might also fail
                    // await prisma.task.delete({ where: { id: newTask.id } }).catch(cleanupError => {
                    //     console.error("Failed to cleanup partially created task:", cleanupError);
                    // });
                    return [2 /*return*/, NextResponse.json({ message: "Internal Server Error: Failed to create control assignments" }, { status: 500 })];
                case 7: return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: newTask_1.id },
                        include: {
                            sensitiveSystem: { select: { systemName: true } },
                            assignedBy: { select: { id: true, name: true } },
                            assignedTo: { select: { id: true, name: true, nameAr: true } },
                            controlAssignments: {
                                include: {
                                    control: true,
                                    assignedUser: { select: { id: true, name: true, nameAr: true } }
                                }
                            }
                        }
                    })];
                case 8:
                    finalTask = _c.sent();
                    if (!finalTask) {
                        // Should not happen if task creation succeeded, but handle just in case
                        throw new Error("Failed to retrieve created task after creating assignments.");
                    }
                    return [2 /*return*/, NextResponse.json(finalTask, { status: 201 })];
                case 9:
                    error_1 = _c.sent();
                    console.error("Error creating task:", error_1);
                    if (error_1 instanceof z.ZodError) {
                        // This case should ideally be caught by safeParse, but as a fallback
                        return [2 /*return*/, NextResponse.json({ message: "Validation failed", errors: error_1.errors }, { status: 400 })];
                    }
                    // Handle potential Prisma errors or other unexpected errors
                    return [2 /*return*/, NextResponse.json({ message: "Internal Server Error" }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// GET handler to fetch tasks, optionally filtered by assignedToId or assigned user's department
export function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, assignedToId, department, whereClause, controlIncludeFields, includeOptions, orderByOptions, tasks, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    searchParams = new URL(request.url).searchParams;
                    assignedToId = searchParams.get('assignedToId');
                    department = searchParams.get('department');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    whereClause = {};
                    controlIncludeFields = {
                        id: true,
                        controlNumber: true,
                        controlText: true,
                        controlType: true,
                        mainComponent: true,
                        subComponent: true,
                    };
                    includeOptions = {
                        sensitiveSystem: {
                            select: {
                                systemName: true,
                                assessment: {
                                    select: {
                                        id: true, // Try selecting 'id' instead of 'assessmentName'
                                    }
                                }
                            }
                        },
                        assignedBy: { select: { id: true, name: true } },
                        assignedTo: { select: { id: true, name: true, nameAr: true, department: true } },
                        // Include controlAssignments with control and assigned user details
                        controlAssignments: {
                            include: {
                                control: { select: controlIncludeFields }, // Still select specific control fields
                                assignedUser: { select: { id: true, name: true, nameAr: true } } // Still select specific user fields
                                // We include the assignment itself fully by default now
                            }
                        }
                    };
                    orderByOptions = {
                        createdAt: 'desc',
                    };
                    // Apply filters based on query parameters
                    if (assignedToId) {
                        // Validate assignedToId format (UUID)
                        if (!z.string().uuid().safeParse(assignedToId).success) {
                            return [2 /*return*/, NextResponse.json({ message: "Invalid Assigned To User ID format" }, { status: 400 })];
                        }
                        whereClause.assignedToId = assignedToId;
                    }
                    else if (department) {
                        // Filter by the department of the assigned user
                        whereClause.assignedTo = {
                            department: department,
                        };
                        // Optionally, you might want to ensure the assigned user is not null
                        // whereClause.assignedToId = { not: null };
                    }
                    return [4 /*yield*/, prisma.task.findMany({
                            where: whereClause,
                            include: includeOptions,
                            orderBy: orderByOptions,
                        })];
                case 2:
                    tasks = _a.sent();
                    return [2 /*return*/, NextResponse.json(tasks)];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error fetching tasks:", error_2);
                    return [2 /*return*/, NextResponse.json({ message: "Internal Server Error" }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
