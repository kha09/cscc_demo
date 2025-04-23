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
// Schema to validate the departmentId from the URL parameters
var paramsSchema = z.object({
    departmentId: z.string().uuid({ message: "Invalid Department ID format in URL" }),
});
// Define the expected structure of the response, including nested relations
// This helps ensure consistency and can be useful for frontend typing
// Note: Adjust based on the actual data needed by the frontend
var taskWithDetailsSchema = z.object({
    id: z.string(),
    deadline: z.date(),
    status: z.string(), // Consider using z.nativeEnum(TaskStatus) if TaskStatus is imported
    createdAt: z.date(),
    sensitiveSystem: z.object({
        systemName: z.string(),
    }).nullable(),
    // Update to reflect ControlAssignment structure
    controlAssignments: z.array(z.object({
        id: z.string(),
        status: z.string(), // Or z.nativeEnum(TaskStatus)
        control: z.object({
            id: z.string(),
            controlNumber: z.string(),
            controlText: z.string(),
        }),
        // Add other assignment fields if needed
    })),
});
// Define expected structure for User relation (if needed later)
// const userSchema = z.object({
//   id: z.string(),
//   name: z.string(),
// });
export function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, // The incoming request object (unused here but required by Next.js)
    _b // Destructure params from the second argument
    ) {
        var validation, departmentId, department, departmentUsers, userIds, tasks, validatedTasks, error_1;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    validation = paramsSchema.safeParse(params);
                    if (!validation.success) {
                        return [2 /*return*/, NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 })];
                    }
                    departmentId = validation.data.departmentId;
                    return [4 /*yield*/, prisma.department.findUnique({
                            where: { id: departmentId },
                            select: { name: true },
                        })];
                case 1:
                    department = _c.sent();
                    if (!department) {
                        return [2 /*return*/, NextResponse.json({ message: "Department not found" }, { status: 404 })];
                    }
                    return [4 /*yield*/, prisma.user.findMany({
                            where: {
                                department: department.name,
                                role: 'DEPARTMENT_MANAGER', // Assuming tasks are assigned to Department Managers
                            },
                            select: { id: true },
                        })];
                case 2:
                    departmentUsers = _c.sent();
                    if (departmentUsers.length === 0) {
                        // No manager found for this department, return empty list or appropriate response
                        return [2 /*return*/, NextResponse.json([])];
                    }
                    userIds = departmentUsers.map(function (user) { return user.id; });
                    return [4 /*yield*/, prisma.task.findMany({
                            where: {
                                assignedToId: {
                                    in: userIds, // Filter tasks assigned to any user in this department
                                },
                            },
                            include: {
                                sensitiveSystem: {
                                    select: { systemName: true },
                                },
                                // Include ControlAssignments and the nested Control
                                controlAssignments: {
                                    include: {
                                        control: {
                                            select: { id: true, controlNumber: true, controlText: true },
                                        },
                                    },
                                },
                                assignedTo: {
                                    select: { id: true, name: true }
                                },
                                assignedBy: {
                                    select: { id: true, name: true }
                                }
                            },
                            orderBy: {
                                createdAt: 'desc', // Order tasks by creation date, newest first
                            },
                        })];
                case 3:
                    tasks = _c.sent();
                    validatedTasks = z.array(taskWithDetailsSchema).safeParse(tasks);
                    if (!validatedTasks.success) {
                        console.error("Task data validation error:", validatedTasks.error);
                        // Decide how to handle: return partial data, error, or log and return original tasks
                        // For now, return the original tasks but log the validation error
                        // return NextResponse.json({ message: "Task data validation failed on server" }, { status: 500 });
                    }
                    // Return the fetched tasks
                    // Use validatedTasks.data if validation is strictly enforced, otherwise use tasks
                    return [2 /*return*/, NextResponse.json(tasks)];
                case 4:
                    error_1 = _c.sent();
                    console.error("Error fetching tasks for department:", error_1);
                    // Handle potential Prisma errors (e.g., department not found - though findMany won't error)
                    // or other unexpected errors
                    return [2 /*return*/, NextResponse.json({ message: "Internal Server Error" }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
