<?php

namespace App\Http\Controllers;

use App\Models\ChatGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\AddonSetting;

class Chat_groupsController extends Controller
{
    // ✅ Moved the check logic into controller for now (can optionally shift to User model)
    private function companyHasChatSupport($user): bool
    {
        if (!in_array($user->role, ['tenant', 'customer'])) {
            return true;
        }

        $customer = $user->customer;

        if (!$customer || !$customer->company) {
            return false;
        }

        // ✅ Use AddonSetting (mapped to 'addons' table)
        return AddonSetting::where('company_id', $customer->company->id)
            ->where('name', 'chat_support')
            ->exists();
    }

    // ✅ Endpoint to check chat support availability
    public function hasChatSupport(Request $request): JsonResponse
    {
        $user = Auth::user();

        $allowed = $this->companyHasChatSupport($user);

        \Log::info('Chat Support Check', [
            'userId'     => $user->id,
            'email'      => $user->email,
            'allowed'    => $allowed,
            'hasCustomer'=> $user->customer ? true : false,
            'companyId'  => $user->customer?->company_id,
            // ✅ FIXED: No relation-based access here
            'addons'     => AddonSetting::where('company_id', $user->customer?->company_id)->pluck('name'),
        ]);

        return response()->json([
            'allowed' => $allowed,
        ]);
    }

    // ✅ Get all groups the authenticated user belongs to
    public function myGroups(Request $request): JsonResponse
    {
        $groups = $request->user()->chatGroups()->with('users')->get();

        return response()->json(['groups' => $groups]);
    }

    // ✅ Create a new group
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$this->companyHasChatSupport($user)) {
            return response()->json([
                'message' => 'Chat support is not enabled for your company.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name'       => 'nullable|string|max:255',
            'type'       => 'in:tenant,customer,company_admin,custom',
            'user_ids'   => 'array',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $group = ChatGroup::create([
            'name'       => $request->name,
            'type'       => $request->type ?? 'custom',
            'created_by' => $user->id,
        ]);

        $userIdsToAttach = [];

        if (in_array($group->type, ['tenant', 'customer'])) {
            $userIdsToAttach = User::whereIn('role', ['tenant', 'customer'])->pluck('id')->toArray();
        } elseif ($group->type === 'company_admin') {
            $userIdsToAttach = User::where('role', 'company_admin')->pluck('id')->toArray();
        } else {
            $userIdsToAttach = $request->user_ids ?? [];
        }

        $userIdsToAttach[] = $user->id;
        $userIdsToAttach = array_unique($userIdsToAttach);

        $group->users()->attach($userIdsToAttach);

        return response()->json([
            'message' => 'Group created',
            'group' => $group->load('users')
        ]);
    }

    // ✅ Add user to group
    public function addUser(Request $request, $groupId): JsonResponse
    {
        $group = ChatGroup::findOrFail($groupId);
        $userId = $request->input('user_id');

        if (!$userId || !User::find($userId)) {
            return response()->json(['message' => 'Invalid user ID'], 400);
        }

        $group->users()->syncWithoutDetaching([$userId]);

        return response()->json(['message' => 'User added to group']);
    }

    // ✅ Remove user from group
    public function removeUser(Request $request, $groupId): JsonResponse
    {
        $group = ChatGroup::findOrFail($groupId);
        $userId = $request->input('user_id');

        $group->users()->detach($userId);

        return response()->json(['message' => 'User removed from group']);
    }
}
