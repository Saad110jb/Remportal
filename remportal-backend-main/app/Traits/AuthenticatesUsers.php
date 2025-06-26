<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\CompanyUser;

trait AuthenticatesUsers
{
    /**
     * Common method to authenticate users based on role.
     */
    protected function authenticateUser(Request $request, string $role)
    {
        // Validate login credentials
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Find user by email
        $user = CompanyUser::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return new JsonResponse(['message' => 'Invalid credentials'], 401);
        }

        // Ensure user has the required role
        // if (!$user->hasRole($role)) {
        //     return new JsonResponse(['message' => 'Unauthorized'], 403);
        // }

        // Generate access token
        $token = $user->createToken($role . 'Token')->plainTextToken;

        return new JsonResponse([
            'message' => ucfirst($role) . ' login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role
            ]
        ], 200);
    }
}
