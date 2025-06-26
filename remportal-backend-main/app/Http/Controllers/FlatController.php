<?php

namespace App\Http\Controllers;

use App\Models\Flat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Property;

class FlatController extends Controller
{
public function flatsByOwner(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $creatorId = $user->created_by ?? $user->id;

    $propertyId = $request->query('property_id');

    if (!$propertyId) {
        return response()->json(['error' => 'Property ID is required'], 400);
    }

    // ✅ Use `user_id` instead of `created_by`
    $property = Property::where('id', $propertyId)
                        ->where('user_id', $creatorId)
                        ->first();

    if (!$property) {
        return response()->json(['error' => 'Unauthorized or invalid property.'], 403);
    }

    $flats = Flat::where('property_id', $propertyId)->get();

    return response()->json(['flats' => $flats]);
}



public function index(Request $request)
{
    $perPage = $request->query('offset', 10);

    // Get logged-in user
    $user = $request->user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Get property IDs owned by this user
    $propertyIds = Property::where('user_id', $user->id)->pluck('id');

    // Build the query
    $query = Flat::with(['property', 'owner'])
        ->whereIn('property_id', $propertyIds)
        ->orderBy('id', 'desc');

    if ($request->has('type') && in_array($request->type, ['commercial', 'residential'])) {
        $query->where('type', $request->type);
    }

    $flats = $query->paginate($perPage);

    return response()->json($flats);
}

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|exists:properties,id',
            'name' => 'required|string|max:255',
            'size' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'address' => 'required|string',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'kitchen' => 'nullable|integer|min:0',
            'balcony' => 'nullable|integer|min:0',
            'is_running' => 'nullable|integer|min:0',
            'status' => 'required|in:available,sold,reserved',
            'type' => 'required|in:commercial,residential',
            'company_id' => 'nullable|exists:companies,id',
            'owner_id' => 'nullable|exists:company_users,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();

        // If company_id is not passed, use from logged-in user if available
        if (empty($validated['company_id']) && auth()->check()) {
            $validated['company_id'] = auth()->user()->company_id ?? null;
        }

        if (!$validated['company_id']) {
            return response()->json(['error' => 'Company ID is required.'], 422);
        }

        Flat::create($validated);

        return response()->json('Flat created successfully.');
    }

    public function show($id)
{
    $flat = Flat::findOrFail($id);

    // Optionally, check if the user has access to this flat
    

    return response()->json($flat);
}


    public function update(Request $request, $id)
    {
        $flat = Flat::find($id);

        if (!$flat) {
            return new JsonResponse('Flat not found', 404);
        }

        $validator = Validator::make($request->all(), [
            
            'name' => 'sometimes|string|max:255',
            'size' => 'sometimes|integer|min:1',
            'price' => 'sometimes|numeric|min:0',
            'address' => 'sometimes|string',
            'bedrooms' => 'sometimes|integer|min:0',
            'bathrooms' => 'sometimes|integer|min:0',
            'kitchen' => 'nullable|integer|min:0',
            'balcony' => 'nullable|integer|min:0',
            'is_running' => 'nullable|integer|min:0',
            'status' => 'sometimes|in:available,sold,reserved',
            'type' => 'required|in:commercial,residential',
            
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }

        $validated_data = $validator->validated();

        unset($validated_data['company_id']); // Prevent accidental company switch

        $flat->update($validated_data);

        return new JsonResponse('Flat updated successfully', 200);
    }

    public function my_flats(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $flats = $request->user()->flats->load('payments');
        return new JsonResponse($flats, 200);
    }

    public function destroy($id)
    {
        $flat = Flat::find($id);

        if (!$flat) {
            return new JsonResponse("Flat not found", 404);
        }

        $flat->delete();

        return new JsonResponse('Flat deleted successfully');
    }
}
