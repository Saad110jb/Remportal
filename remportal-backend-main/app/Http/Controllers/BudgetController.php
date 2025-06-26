<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    /**
     * Display a listing of budgets for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Return only budgets created by the current user
        $budgets = Budget::with(['company', 'user'])
                         ->where('user_id', $user->id)
                         ->get();

        return response()->json($budgets);
    }

    /**
     * Store a newly created budget.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'type'       => 'required|in:daily,monthly,half_yearly,yearly',
            'date'       => 'required|date',
            'amount'     => 'required|numeric',
            'category'   => 'nullable|string|max:255',
            'notes'      => 'nullable|string',
        ]);

        // Inject user_id into validated data
        $validated['user_id'] = $user->id;

        $budget = Budget::create($validated);

        return response()->json($budget, 201);
    }

    /**
     * Display the specified budget.
     */
    public function show(Request $request, Budget $budget)
    {
        
        $budget->load(['company', 'user']);
        return response()->json($budget);
    }

    /**
     * Update the specified budget.
     */
    public function update(Request $request, Budget $budget)
    {
         // optional

        $validated = $request->validate([
            
            'type'       => 'sometimes|required|in:daily,monthly,half_yearly,yearly',
            'date'       => 'sometimes|required|date',
            'amount'     => 'sometimes|required|numeric',
            'category'   => 'nullable|string|max:255',
            'notes'      => 'nullable|string',
        ]);

        $budget->update($validated);

        return response()->json($budget);
    }

    /**
     * Remove the specified budget.
     */
    public function destroy(Request $request, Budget $budget)
    {
        $this->authorize('delete', $budget); // optional

        $budget->delete();

        return response()->json(null, 204);
    }
}
