<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmployeeController extends Controller
{
    /**
     * Return employees related to the current user.
     */
    public function index(Request $request)
    {
        $userId = $request->header('user_id'); // Or use auth()->id() if authenticated

        $employees = Employee::with(['user:id,name,email', 'department:id,name'])
            ->where('user_id', $userId)
            ->get()
            ->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'user_id' => $emp->user_id,
                    'name' => $emp->name,
                    'designation' => $emp->designation,
                    'phone' => $emp->phone,
                    'email' => $emp->email,
                    'joining_date' => $emp->joining_date,
                    'status' => $emp->status,
                    'department' => $emp->department,
                    'user' => $emp->user,
                ];
            });

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        try {
            Log::info('Incoming employee data:', $request->all());

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'user_id' => 'required|exists:users,id',
                'department_id' => 'required|integer',
                'designation' => 'required|string',
                'phone' => 'required|string',
                'email' => 'required|email',
                'emergency_contact' => 'nullable|string',
                'joining_date' => 'required|date',
                'salary' => 'required|numeric',
                'status' => 'required|in:active,inactive,resigned,terminated',
            ]);

            $employee = Employee::create($validated);

            return response()->json(['message' => 'Employee added!', 'employee' => $employee], 201);
        } catch (\Throwable $e) {
            Log::error('Error while creating employee: ' . $e->getMessage());
            return response()->json(['error' => 'Server Error', 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Employee $employee)
    {
        $employee->load(['user', 'department']);
        return response()->json($employee);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'designation' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'emergency_contact' => 'nullable|string|max:20',
            'joining_date' => 'nullable|date',
            'salary' => 'nullable|numeric',
            'status' => 'nullable|string|in:active,inactive,resigned,terminated',
        ]);

        $employee->update($validated);

        return response()->json($employee);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json(null, 204);
    }
}
