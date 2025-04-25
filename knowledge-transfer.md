# Knowledge Transfer: Department Manager Page UI Refactor

## Work Completed

The primary goal was to refactor the UI logic in `app/department-manager/page.tsx`. The following changes were implemented:

1.  **"المهام المعينة لك" Table:**
    *   In the "الإجراءات" (Actions) column, the expand/collapse icon button (`ChevronUp`/`ChevronDown`) was replaced with a text button labeled "عرض التفاصيل" (`variant="ghost" size="sm"`). This button still triggers the expansion of the row below it.
    *   The expanded row (`<tr>`) appearing below the main task row was simplified. It now only contains:
        *   Control details (`controlNumber` - `controlText`).
        *   Compliance level display (`Badge` showing `getComplianceLevelText`).
        *   The `Select` dropdown for assigning a team member (`handleAssignControl`).
    *   The `Textarea` for "ملاحظات المقيّم" and the `Select` dropdown for "حالة الضابط" were **removed** from this expanded row.

2.  **"مهام أعضاء الفريق" Card:**
    *   This card now displays assignments allocated to team members (excluding the manager).
    *   Each assignment is rendered within a clickable `div` (`cursor-pointer hover:bg-gray-50`) that toggles an expanded view for that specific assignment using `toggleTeamAssignmentExpansion`.
    *   The main part of the card shows the system name, control number, compliance level badge, assignee, and due date.
    *   The **expanded section** (conditionally rendered using a ternary operator `? : null`) now displays:
        *   "ملاحظات المقيّم" (read-only).
        *   "حالة الضابط" using the `Badge` component with dynamic styling based on the `assignment.status`.

3.  **State Management:**
    *   A new state variable `expandedTeamAssignments` (`Set<string>`) was added to manage the expanded state of individual assignments in the "مهام أعضاء الفريق" card.
    *   The `editState`, `handleEditChange`, and `handleSaveNotesAndStatus` logic related to editing notes/status in the manager's expanded task row were removed or commented out as they are no longer needed there.

## Outstanding Issues & Next Steps

The refactoring introduced persistent errors in `app/department-manager/page.tsx`:

1.  **JSX Syntax Errors:** Despite multiple attempts (using template literals, string concatenation, helper functions, and changing conditional rendering logic), syntax errors persist around lines 635-639 within the `teamAssignments.map(...)` block, specifically related to the `Badge` component used to display "حالة الضابط" in the expanded view of the "مهام أعضاء الفريق" card. The exact cause remains elusive.
2.  **TypeScript Type Errors:** Errors like `Property 'APPROVED' does not exist on type '{ PENDING: "PENDING"; ... }'` reappeared. This strongly indicates that the Prisma Client types (`@prisma/client`) are out of sync with the `prisma/schema.prisma` file (which *does* define `APPROVED` and `REJECTED` in the `TaskStatus` enum).

**Recommended Next Steps:**

1.  **Resolve JSX Error:** Carefully debug the JSX structure within the `teamAssignments.map(...)` block in `app/department-manager/page.tsx`, focusing on the conditional rendering (`? : null`) and the `Badge` component around lines 630-645.
2.  **Update Prisma Client:** Execute `npx prisma generate` in the terminal to regenerate the Prisma Client types and resolve the `TaskStatus` TypeScript errors. If this command fails, investigate potential issues with the Prisma setup or environment variables (`DATABASE_URL`, `DIRECT_URL`).
3.  **Testing:** Thoroughly test the functionality after resolving the errors, ensuring both expanded views work as intended and assignments function correctly.
