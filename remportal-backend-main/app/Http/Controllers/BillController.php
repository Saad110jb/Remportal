<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    // Show all bills (for admin/owner)
    public function index()
    {
        $bills = Bill::with(['customer', 'lease', 'creator'])->latest()->get();
        return response()->json(['bills' => $bills]);
    }

    // Show bills for a specific tenant (customer)
    public function myBills(Request $request)
    {
        $user = $request->user();
        $customer = Customer::where('email', $user->email)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $bills = Bill::with(['lease', 'creator'])->where('customer_id', $customer->id)->get();

        return response()->json(['bills' => $bills]);
    }

    // Store a new bill
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'lease_id' => 'nullable|exists:leases,id'
        ]);

        $bill = Bill::create([
            'customer_id' => $request->customer_id,
            'lease_id' => $request->lease_id,
            'amount' => $request->amount,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'status' => 'unpaid',
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Bill created', 'bill' => $bill], 201);
    }

    // Mark bill as paid
    public function markAsPaid($id)
    {
        $bill = Bill::findOrFail($id);
        $bill->status = 'paid';
        $bill->save();

        return response()->json(['message' => 'Bill marked as paid']);
    }

    // Delete a bill
    public function destroy($id)
    {
        $bill = Bill::findOrFail($id);
        $bill->delete();

        return response()->json(['message' => 'Bill deleted']);
    }
public function billsByCreator(Request $request)
{
    $creatorId = $request->query('created_by'); // fetch created_by from query

    if (!$creatorId) {
        return response()->json(['error' => 'Missing created_by parameter'], 400);
    }

    $bills = Bill::with(['customer', 'lease'])
                ->where('created_by', $creatorId)
                ->orderBy('created_at', 'desc')
                ->get();

    return response()->json(['bills' => $bills], 200);
}

public function show($id)
{
    $bill = Bill::with(['lease', 'customer', 'creator', 'payments'])->find($id);

    if (!$bill) {
        return response()->json(['message' => 'Bill not found'], 404);
    }

    return response()->json(['bill' => $bill]);
}


public function update(Request $request, $id)
{
    $bill = Bill::findOrFail($id);

    $request->validate([
        'amount' => 'required|numeric|min:0',
        'due_date' => 'required|date',
        'status' => 'required|in:paid,unpaid',
        'description' => 'nullable|string',
    ]);

    $bill->update([
        'amount' => $request->amount,
        'due_date' => $request->due_date,
        'status' => $request->status,
        'description' => $request->description,
    ]);

    return response()->json(['message' => 'Bill updated successfully', 'bill' => $bill]);
}
}
