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
// DELETE /api/departments/[departmentId] - Delete a department
export function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var departmentId, department, error_1;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    departmentId = params.departmentId;
                    if (!departmentId) {
                        return [2 /*return*/, NextResponse.json({ message: 'Department ID is required' }, { status: 400 })];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, prisma.department.findUnique({
                            where: { id: departmentId },
                        })];
                case 2:
                    department = _c.sent();
                    if (!department) {
                        return [2 /*return*/, NextResponse.json({ message: 'Department not found' }, { status: 404 })];
                    }
                    // TODO: Add logic here to check if any users are assigned to this department
                    // before allowing deletion. If users are assigned, you might want to prevent
                    // deletion or reassign them first, returning a 409 Conflict or similar error.
                    // Example check (requires adding a relation in User model):
                    // const usersInDepartment = await prisma.user.count({ where: { departmentId: departmentId } });
                    // if (usersInDepartment > 0) {
                    //   return NextResponse.json({ message: 'Cannot delete department with assigned users' }, { status: 409 });
                    // }
                    return [4 /*yield*/, prisma.department.delete({
                            where: { id: departmentId },
                        })];
                case 3:
                    // TODO: Add logic here to check if any users are assigned to this department
                    // before allowing deletion. If users are assigned, you might want to prevent
                    // deletion or reassign them first, returning a 409 Conflict or similar error.
                    // Example check (requires adding a relation in User model):
                    // const usersInDepartment = await prisma.user.count({ where: { departmentId: departmentId } });
                    // if (usersInDepartment > 0) {
                    //   return NextResponse.json({ message: 'Cannot delete department with assigned users' }, { status: 409 });
                    // }
                    _c.sent();
                    return [2 /*return*/, new NextResponse(null, { status: 204 })]; // 204 No Content on successful deletion
                case 4:
                    error_1 = _c.sent();
                    console.error("Error deleting department ".concat(departmentId, ":"), error_1);
                    // Handle potential errors, e.g., foreign key constraints if users depend on it
                    return [2 /*return*/, NextResponse.json({ message: 'Failed to delete department' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
