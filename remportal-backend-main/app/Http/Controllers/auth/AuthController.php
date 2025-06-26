<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    // Register a new user
 public function register(Request $request): JsonResponse
{
    $authenticatedUser = $request->user(); // Currently logged-in user

    $validator = Validator::make($request->all(), [
        'name'     => 'required|string|max:255',
        'email'    => 'required|string|email|max:255|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
        'role'     => 'required|in:super_admin,company_admin,employee,tenant,owner,hr',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    $user = User::create([
        'name'        => $request->name,
        'email'       => $request->email,
        'password'    => Hash::make($request->password),
        'role'        => $request->role,
        'created_by'  => $request->created_by, // optional
    ]);

    // Optional: disable if you don't use email verification or events
    event(new Registered($user));

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type'   => 'Bearer',
    ], 200);
}


    // Login
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 200);
    }

    // Logout
    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }

    // Get current user info
public function me(Request $request): JsonResponse
{
    $user = $request->user();

    if (!$user) {
        logger('⚠️ Sanctum auth failed: user not found from token');
        return response()->json(['message' => 'Unauthenticated'], 403);
    }

    logger('✅ Authenticated user:', [$user->id, $user->email]);

    return response()->json([
        'user' => $user,
        'role' => $user->role,
    ]);
}


// Get all users
public function index(Request $request): JsonResponse
{
    $creatorId = $request->query('created_by');

    if (!$creatorId) {
        return response()->json(['message' => 'Missing created_by parameter'], 400);
    }

    $users = User::where('created_by', $creatorId)->get();

    return response()->json([
        'users' => $users,
    ]);
}


    // Change password
  public function changePassword(Request $request): JsonResponse
{
    $validator = Validator::make($request->all(), [
        'current_password' => 'required',
        'new_password'     => 'required|min:8|confirmed',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    $user = $request->user(); // Automatically resolves from auth:api middleware

    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json(['message' => 'Current password is incorrect'], 403);
    }

    $user->update([
        'password' => Hash::make($request->new_password),
    ]);

    return response()->json(['message' => 'Password changed successfully'], 200);
}
  public function update(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'  => 'sometimes|required|string|max:255',
            'email' => "sometimes|required|email|max:255|unique:users,email,{$user->id}",
            'role'  => 'sometimes|required|in:super_admin,company_admin,employee,tenant,owner',
            // if you want to allow password changes here:
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Only update the provided fields:
        if ($request->filled('name')) {
            $user->name = $request->name;
        }
        if ($request->filled('email')) {
            $user->email = $request->email;
        }
        if ($request->filled('role')) {
            $user->role = $request->role;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['message' => 'User updated successfully.'], 200);
    }

    /**
     * Delete a user account.
     * DELETE /api/users/{id}
     */
    public function destroy($id): JsonResponse
    {
        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->tokens()->delete();   // revoke all Sanctum tokens, if desired
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.'], 200);
    }
}
