<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
public function index(Request $request)
{
    $query = Property::orderBy('id', 'desc');

    if ($request->has('user_id')) {
        $query->where('user_id', $request->user_id);
    }

    return response()->json($query->get());
}
 public function myProperties(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 403);
        }

        $properties = Property::where('created_by', $user->id)->get();

        return response()->json([
            'properties' => $properties
        ]);
    }

    public function store(Request $request)
    { // ✅ Add this line
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,sold,rented',
            'property_for' => 'required|in:rent,sale',
            'type' => 'required|in:commercial,residential',
            'owner_id' => 'required|exists:company_users,id',
            'company_id' => 'required|exists:companies,id',
            'is_running' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $property = Property::create($validator->validated());

         
return response()->json([
    'message' => 'Property created successfully.',
    'property' => $property
]);

    
    }

    public function show($id)
    {
        $property = Property::with(['flats'])->find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        return response()->json($property);
    }

    public function update(Request $request, $id)
{
    $property = Property::find($id);

    if (!$property) {
        return response()->json(['message' => 'Property not found'], 404);
    }

    $user = auth()->user();

    // ✅ Prevent other users from editing this property
    if ($property->user_id !== $user->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $validator = Validator::make($request->all(), [
        'name' => 'sometimes|string|max:255',
        'description' => 'sometimes|string',
        'location' => 'sometimes|string',
        'price' => 'sometimes|numeric|min:0',
        'status' => 'sometimes|in:available,sold,rented',
        'property_for' => 'sometimes|in:rent,sale',
        'type' => 'sometimes|in:commercial,residential',
        'is_running' => 'nullable|integer|min:0',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    $property->update($validator->validated());

    return response()->json([
        'message' => 'Property updated successfully.',
        'property' => $property
    ]);
}


    public function destroy($id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted successfully.']);
    }
}
