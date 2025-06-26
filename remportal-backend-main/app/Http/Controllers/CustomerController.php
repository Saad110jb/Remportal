<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index()
    {
        $customers = Customer::with(['company', 'user', 'flat'])->get();
        return response()->json($customers);
    }
    public function index1(Request $request)
{
    $query = Customer::query();

    if ($request->has('user_id')) {
        $query->where('user_id', $request->user_id);
    }

    return response()->json([
        'customers' => $query->get()
    ]);
}
public function myCustomer(Request $request)
{
    $userId = auth()->id(); // or $request->user()->id

    $customer = Customer::where('user_id', $userId)->first();

    if (!$customer) {
        return response()->json(['message' => 'Customer not found'], 404);
    }

    return response()->json(['customer' => $customer]);
}
public function customerLogin(Request $request)
{
    $credentials = $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
    ]);

    $customer = Customer::where('email', $credentials['email'])->first();

    if (!$customer || !Hash::check($credentials['password'], $customer->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = User::find($customer->user_id);
    if (!$user) {
        return response()->json(['message' => 'User not found for this customer'], 404);
    }

    // ✅ Use plainTextToken instead of accessToken object
    $token = $user->createToken('CustomerLogin')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'user'         => $user,
        'role'         => 'tenant',
    ]);
}

public function getCustomerByUser(Request $request)
{
    $user = $request->user();

    $customer = Customer::where('user_id', $user->id)->first();

    if (!$customer) {
        return response()->json(['message' => 'No customer found for this user'], 404);
    }

    return response()->json(['customer' => $customer], 200);
}

public function customersByCreator(Request $request)
{
    $query = Customer::query();

    if ($request->has('user_id')) {
        $query->where('created_by', $request->user_id);
    }

    return response()->json([
        'customers' => $query->get()
    ]);
}

    /**
     * Store a newly created customer.
     */
  public function store(Request $request)
{
    // Validate request including customer + user info
    $validated = $request->validate([
        'name'       => 'required|string|max:255',
        'email'      => 'required|email|unique:users,email',  // unique on users.email
        'password'   => 'required|string|min:6|confirmed',   // confirm password expected
        'company_id' => 'required|exists:companies,id',
        'phone'      => 'nullable|string|max:20',
        'address'    => 'nullable|string|max:255',
        'status'     => ['nullable', Rule::in(['active', 'inactive'])],
        // no user_id or flat_id because user is created here
        'flat_id'    => 'nullable|exists:flats,id',
    ]);

    // Create user with role tenant
    $user = User::create([
        'name'     => $validated['name'],
        'email'    => $validated['email'],
        'password' => Hash::make($validated['password']),
        'role'     => 'tenant', // default role
    ]);

    // Create customer linked to this user
    $customer = Customer::create([
        'name'       => $validated['name'],
        'email'      => $validated['email'],
        'password'   => $validated['password'], // Model mutator will hash again, or you can pass hashed password directly (or modify model accordingly)
        'company_id' => $validated['company_id'],
        'user_id'    => $user->id,
        'flat_id'    => $validated['flat_id'] ?? null,
        'phone'      => $validated['phone'] ?? null,
        'address'    => $validated['address'] ?? null,
        'status'     => $validated['status'] ?? 'active',
    ]);

    return response()->json([
        'message'  => 'Customer and user registered successfully.',
        'user'     => $user,
        'customer' => $customer,
    ], 201);
}
    /**
     * Display the specified customer.
     */
    public function show($id)
    {
        $customer = Customer::with(['company', 'user', 'flat'])->findOrFail($id);
        return response()->json($customer);
    }

    
    /**
     * Update the specified customer.
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            
            'company_id' => 'sometimes|required|exists:companies,id',
            
            'flat_id'    => 'nullable|exists:flats,id',
            'phone'      => 'nullable|string|max:20',
            'address'    => 'nullable|string|max:255',
            'status'     => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        

        $customer->update($validated);

        return response()->json([
            'message' => 'Customer updated successfully.',
            'customer' => $customer,
        ]);
    }

    /**
     * Remove the specified customer.
     */
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ]);
    }
    public function getMyCustomers(Request $request)
{
    $user = $request->user(); // Gets the currently authenticated user

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    // Fetch customers where user_id = user's id AND email = user's email
    $customers = Customer::where('user_id', $user->id)
                         ->where('email', $user->email)
                         ->get();

    return response()->json([
        'customers' => $customers
    ], 200);
}
public function getMyCreatedCustomer(Request $request)
{
    $authUser = $request->user();

    if (!$authUser) {
        return response()->json(['message' => 'Unauthenticated'], 403);
    }

    $customer = Customer::where('created_by', $authUser->id)
                        ->where('email', $authUser->email)
                        ->first();

    if (!$customer) {
        return response()->json(['message' => 'Customer not found'], 404);
    }

    return response()->json(['customer' => $customer], 200);
}

}
