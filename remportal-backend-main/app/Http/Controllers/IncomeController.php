<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lease;
use App\Models\Payment;

class IncomeController extends Controller
{
    /**
     * Get total income for leases created by the logged-in owner
     */
    public function getOwnerIncome(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'owner') {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        // Step 1: Get leases created by the logged-in user
        $leases = Lease::with(['property', 'flat', 'customer'])
            ->where('created_by', $user->id)
            ->get();

        if ($leases->isEmpty()) {
            return response()->json([
                'owner' => $user->name,
                'total_income' => 0,
                'lease_count' => 0,
                'leases' => [],
            ]);
        }

        // Step 2: Get customer IDs from leases
        $customerIds = $leases->pluck('customer_id')->unique();

        // Step 3: Get all payments made by these customers
        $payments = Payment::whereIn('customer_id', $customerIds)->get();

        // Step 4: Calculate total income
        $totalIncome = $payments->sum('amount');

        return response()->json([
            'owner' => $user->name,
            'total_income' => $totalIncome,
            'lease_count' => $leases->count(),
            'leases' => $leases,
        ]);
    }
}
