<?php

namespace App\Http\Controllers;

use App\Models\Attendence;
use Illuminate\Http\Request;

class AttendenceController extends Controller
{
    /**
     * Display a listing of attendance records.
     */
    public function index()
    {
        $attendances = Attendence::with('employee')->get();
        return response()->json($attendances);
    }

    /**
     * Store a newly created attendance record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,leave',
        ]);

        // Check for unique employee_id + date to prevent duplicates
        $exists = Attendence::where('employee_id', $validated['employee_id'])
            ->where('date', $validated['date'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Attendance record for this employee and date already exists.'], 422);
        }

        $attendance = Attendence::create($validated);

        return response()->json($attendance, 201);
    }

    /**
     * Display the specified attendance record.
     */
    public function show(Attendence $attendance)
    {
        $attendance->load('employee');
        return response()->json($attendance);
    }

    /**
     * Update the specified attendance record.
     */
    public function update(Request $request, Attendence $attendance)
    {
        $validated = $request->validate([
            'employee_id' => 'sometimes|required|exists:employees,id',
            'date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:present,absent,leave',
        ]);

        if (isset($validated['employee_id']) && isset($validated['date'])) {
            // Check for duplicate attendance if employee_id and date changed
            $exists = Attendence::where('employee_id', $validated['employee_id'])
                ->where('date', $validated['date'])
                ->where('id', '!=', $attendance->id)
                ->exists();

            if ($exists) {
                return response()->json(['message' => 'Attendance record for this employee and date already exists.'], 422);
            }
        }

        $attendance->update($validated);

        return response()->json($attendance);
    }
public function getEmployeeAttendance($employee_id)
{
    $attendanceRecords = Attendence::with('employee')
        ->where('employee_id', $employee_id)
        ->orderBy('date', 'desc')
        ->get();

    if ($attendanceRecords->isEmpty()) {
        return response()->json(['message' => 'No attendance records found for this employee.'], 404);
    }

    return response()->json($attendanceRecords);
}
    /**
     * Remove the specified attendance record.
     */
    public function destroy(Attendence $attendance)
    {
        $attendance->delete();
        return response()->json(null, 204);
    }
}
