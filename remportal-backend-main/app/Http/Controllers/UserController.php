<?php

namespace App\Http\Controllers;

use App\Models\CompanyUser;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
   public function get_users()
{
    $users = CompanyUser::with(['roles', 'permissions', 'company'])
        ->orderBy('id', 'desc')
        ->get()
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->permissions->pluck('name'),
                'email_verified_at' => $user->email_verified_at,
                'approved' => $user->approved,
                'created_at' => $user->created_at,
                'company' => $user?->company?->name,
            ];
        });

    return response()->json($users);
}

    public function get_user($id)
    {
        try {
            $user = CompanyUser::with(['flats'])->findOrFail($id);
            return new JsonResponse($user, 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return new JsonResponse('User not found', 404);
        }
    }
    public function approve($id)
    {
        $user = CompanyUser::find($id);
        if(!$user){
            return new JsonResponse("User not found.",404);
        }
        $user->approved = true;
        $user->save();

        return new JsonResponse("User approved successfully!",200);
    }
     public function myTenants(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 403);
        }

        $tenants = User::where('role', 'tenant')
            ->where('created_by', $user->id)
            ->get();

        return response()->json([
            'tenants' => $tenants
        ]);
    }
}
