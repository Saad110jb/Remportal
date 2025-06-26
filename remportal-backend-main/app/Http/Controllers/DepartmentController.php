<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments for the logged-in user.
     */
    public function index(Request $request)
    {
        $userId = $request->header('user_id');

        $departments = Department::with('company', 'head')
            ->whereHas('company', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();

        return response()->json($departments);
    }

    /**
     * Store a newly created department.
     */
public function store(Request $request)
{
    $userId = $request->header('user_id');

    $validated = $request->validate([
        'company_id' => 'nullable|exists:companies,id',
        'name' => 'required|string|max:255',
        'head_id' => 'nullable|exists:employees,id',
    ]);

    // ✅ Just assign user_id directly now
    $validated['user_id'] = $userId;

    $department = Department::create($validated);

    return response()->json($department, 201);
}


    /**
     * Display the specified department.
     */
    public function show(Request $request, Department $department)
    {
        $userId = $request->header('user_id');

        if ($department->company->user_id != $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $department->load('company', 'head');
        return response()->json($department);
    }

    /**
     * Update the specified department.
     */
    public function update(Request $request, Department $department)
    {
        $userId = $request->header('user_id');

        if ($department->company->user_id != $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'name' => 'sometimes|required|string|max:255',
            'head_id' => 'nullable|exists:employees,id',
        ]);

        $department->update($validated);

        return response()->json($department);
    }

    /**
     * Remove the specified department.
     */
    public function destroy(Request $request, Department $department)
    {
        $userId = $request->header('user_id');

        if ($department->company->user_id != $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $department->delete();
        return response()->json(null, 204);
    }
}
