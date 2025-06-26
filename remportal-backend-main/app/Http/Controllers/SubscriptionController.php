<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SubscriptionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
        'plan' => 'required|string',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after:start_date',

        ]);

        $user = $request->user(); // Authenticated user (e.g., company admin)

        $subscription = Subscription::updateOrCreate(
            ['user_id' => $user->id],
            array_merge($validated, [
                'is_active' => true,
                'company_id' => $user->company_id ?? null, // 👈 Safely include company_id
            ])
        );

        return response()->json([
            'message' => 'Subscription saved',
            'data' => $subscription,
        ]);
    }
     
 
private function handleExpiredSubscriptionAddons(int $companyId): ?Collection
{
    $company = Company::with('addons')->find($companyId);

    if (!$company || !$company->subscription_ends_at) {
        return null;
    }

    if (Carbon::parse($company->subscription_ends_at)->isPast()) {
        foreach ($company->addons as $addon) {
            $addon->name = 'no_chat_support';
            $addon->save();
        }
        return $company->addons;
    }

    return null; // No change if subscription is still active
}
public function checkExpiredAddons(Request $request)
{
    $companyId = $request->company_id;

    $updatedAddons = $this->handleExpiredSubscriptionAddons($companyId);

    if (!$updatedAddons) {
        return response()->json(['message' => 'No expired subscription or no addons updated.']);
    }

    return response()->json([
        'message' => 'Addons updated due to expired subscription.',
        'updated_addons' => $updatedAddons
    ]);
}

}
