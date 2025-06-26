<?php

namespace App\Http\Controllers;

use App\Models\AddonSetting;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
class AddonController extends Controller
{
    public function index(Request $request)
{
    $query = AddonSetting::query();

    if ($request->has('company_id')) {
        $query->where('company_id', $request->company_id);
    }

    return response()->json(['addons' => $query->get()]);
}


    // In AddonController.php
public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'price' => 'required|numeric',
        'description' => 'nullable|string',
        'company_id' => 'required|exists:companies,id', // validate company_id
    ]);

    $addon = AddonSetting::create($request->only('name', 'price', 'description', 'company_id'));

    return response()->json(['addon' => $addon], 201);
}
    public function update(Request $request, $id)
    {
        $addon = AddonSetting::findOrFail($id);

        $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $addon->update($request->only('name', 'price', 'description'));

        return response()->json(['addon' => $addon]);
    }

    public function destroy($id)
    {
        $addon = AddonSetting::findOrFail($id);
        $addon->delete();

        return response()->json(['message' => 'Addon deleted']);
    }
    public function expireAddonsIfSubscriptionExpired(Request $request)
{
    $request->validate([
        'company_id' => 'required|exists:companies,id',
    ]);

    $company = Company::with('addons')->find($request->company_id);

    if (!$company || !$company->subscription_ends_at) {
        return response()->json(['message' => 'No subscription info.'], 404);
    }

    if (Carbon::parse($company->subscription_ends_at)->isPast()) {
        foreach ($company->addons as $addon) {
            $addon->name = 'no_chat_support';
            $addon->save();
        }

        return response()->json([
            'message' => 'Subscription expired. Addons updated.',
            'updated_addons' => $company->addons,
        ]);
    }

    return response()->json([
        'message' => 'Subscription is still active.',
        'addons' => $company->addons,
    ]);
}

   public function assign(Request $request)
{
    $request->validate([
        'addon_ids' => 'required|array',
        'addon_ids.*' => 'exists:addons,id', // Correct table name if needed
        'company_id' => 'required|exists:companies,id',
    ]);

    $company = \App\Models\Company::findOrFail($request->company_id);
    $company->addons()->sync($request->addon_ids);

    return response()->json(['message' => 'Addons assigned to company']);
}

}
