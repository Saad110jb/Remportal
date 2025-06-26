<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Company;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    public function destroy($id)
{
    $company = Company::find($id);
    if (!$company) {
        return response()->json(['error' => 'Company not found'], 404);
    }
    $company->delete();
    return response()->json(['message' => 'Company deleted successfully']);
}

    public function register(Request $request)
    {
        // Validate input for company only
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'months'      => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Create company
            $company = Company::create([
                'name' => $request->company_name,
                'subscription_ends_at' => now()->addMonths($request->months),
                'status' => 'active',
            ]);

            // Return company info for further use (e.g. create admin user)
            return response()->json(['message' => 'Company created successfully.', 'company' => $company], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
    }

    public function index()
    {
        $companies = Company::all();
        return response()->json($companies);
    }

    public function renew(Request $request)
{
    $request->validate([
        'company_id' => 'required|exists:companies,id',
        'months' => 'required|integer|min:1',
    ]);

    $company = Company::find($request->company_id);

    // Convert to Carbon instance before using addMonths
    $currentEnd = $company->subscription_ends_at ? Carbon::parse($company->subscription_ends_at) : now();
    $company->subscription_ends_at = $currentEnd->addMonths($request->months);
    $company->save();

    return response()->json(['message' => 'Subscription renewed successfully.']);
}
}
