<?php

// app/Http/Controllers/LeaseController.php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Flat;
use App\Models\Lease;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LeaseController extends Controller
{
    public function index(): JsonResponse
    {
        $leases = Lease::with(['user', 'property', 'flat'])->latest()->get();
        return response()->json(['leases' => $leases], 200);
    }


public function store(Request $request)
{
    $request->validate([
        
        'customer_id' => 'required|exists:customers,id',
        'property_id' => 'required|exists:properties,id',
        'flat_id' => 'nullable|exists:flats,id',
        'start_date' => 'required|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
        'monthly_rent' => 'required|numeric',
        'status' => 'required|in:active,terminated,completed',
    ]);

    $authUser = $request->user();
    $creatorId = $authUser->created_by ?? $authUser->id;

    // ✅ No more ownership check on customer
    $customer = Customer::find($request->customer_id);
    if (!$customer) {
        return response()->json(['message' => 'Customer not found.'], 404);
    }

    // ✅ Property ownership check remains
    $property = Property::where('id', $request->property_id)
        ->where('user_id', $creatorId)
        ->first();

    if (!$property) {
        return response()->json(['message' => 'Unauthorized property selection.'], 403);
    }

    // ✅ Flat ownership (optional)
    if ($request->flat_id) {
        $flat = Flat::where('id', $request->flat_id)
            ->where('property_id', $property->id)
            ->first();

        if (!$flat) {
            return response()->json(['message' => 'Unauthorized flat selection.'], 403);
        }
    }

$lease = Lease::create([
  'customer_id' => $request->customer_id,
  'property_id' => $request->property_id,
  'flat_id' => $request->flat_id,
  'start_date' => $request->start_date,
  'end_date' => $request->end_date,
  'monthly_rent' => $request->monthly_rent,
  'status' => $request->status,
  'created_by' => $request->created_by, // <-- important
]);

    return response()->json(['message' => 'Lease created successfully.']);
}
public function getLeasesByCreator(Request $request): JsonResponse
{
    $authUser = $request->user();
    if (!$authUser) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    $leases = Lease::with(['customer', 'flat', 'property'])
                   ->where('created_by', $authUser->id)
                   ->latest()
                   ->get();

    return response()->json(['leases' => $leases], 200);
}

public function getLeasesByCustomerid($customer_id): JsonResponse
{
    $leases = Lease::with(['user', 'property', 'flat'])
                   ->where('customer_id', $customer_id)
                   ->latest()
                   ->get();

    return response()->json(['leases' => $leases], 200);
}

public function getLeasesByCreatorUser(Request $request): JsonResponse
{
    $authUser = $request->user();
    if (!$authUser) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    $creatorId = $authUser->created_by ?? $authUser->id;

    // 🔍 Fetch all customers created by creatorId
    $customers = Customer::where('user_id', $creatorId)->get();

    // ✅ Filter to match customer where email equals logged-in user's email
    $matchedCustomer = $customers->firstWhere('email', $authUser->email);

    if (!$matchedCustomer) {
        return response()->json(['leases' => [], 'message' => 'No matching customer found for this user email.'], 404);
    }

    // 📦 Fetch leases of this matched customer
    $leases = Lease::with(['user', 'property', 'flat'])
                   ->where('customer_id', $matchedCustomer->id)
                   ->latest()
                   ->get();

    return response()->json(['leases' => $leases], 200);
}
public function getLeasesByCustomer($customer_id): JsonResponse
{
    $leases = Lease::with(['user', 'property', 'flat'])
                   ->where('customer_id', $customer_id)
                   ->latest()
                   ->get();

    return response()->json(['leases' => $leases], 200);
}


    public function show($id): JsonResponse
    {
        $lease = Lease::with(['user', 'property', 'flat'])->find($id);

        if (!$lease) {
            return response()->json(['message' => 'Lease not found.'], 404);
        }

        return response()->json($lease);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $lease = Lease::find($id);
        if (!$lease) {
            return response()->json(['message' => 'Lease not found.'], 404);
        }

        $lease->update($request->only([
            'start_date', 'end_date', 'monthly_rent', 'status'
        ]));

        return response()->json(['message' => 'Lease updated successfully.', 'lease' => $lease]);
    }

    public function destroy($id): JsonResponse
    {
        $lease = Lease::find($id);
        if (!$lease) {
            return response()->json(['message' => 'Lease not found.'], 404);
        }

        $lease->delete();

        return response()->json(['message' => 'Lease deleted successfully.']);
    }
}
