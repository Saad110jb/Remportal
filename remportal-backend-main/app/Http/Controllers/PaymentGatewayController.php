<?php

namespace App\Http\Controllers;

use App\Models\PaymentGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PaymentGatewayController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
       
        $company = Auth::user();
        $gateways = PaymentGateway::byCompany($company)
            ->when($type, function ($query) use ($type) {
                $query->where('type', $type);
            })
            ->get();

        return response()->json($gateways);
    }

    // Store a new payment gateway
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:payment_gateways,name,NULL,id,company_id,' . $user->company_id,
            'logo_url' => 'required|url',
            'type' => 'required|in:mobile_bank,bank',
            'theme_color' => 'required|string',
            'receiver_number' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'account_name' => 'nullable|string',
            'account_number' => 'nullable|string',
            'branch_name' => 'nullable|string',
            'routing_number' => 'nullable|string',
            'payment_instructions' => 'required|string',
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }

        // Always assign company_id from the authenticated user
        $company_id = $user->company_id;

        if (!$company_id) {
            return response()->json("Company ID is required.", 422);
        }

        $gateway = PaymentGateway::create([
            'company_id' => $company_id,
            'name' => $request->name,
            'logo_url' => $request->logo_url,
            'type' => $request->type,
            'theme_color' => $request->theme_color,
            'receiver_number' => $request->receiver_number,
            'bank_name' => $request->bank_name,
            'account_name' => $request->account_name,
            'account_number' => $request->account_number,
            'branch_name' => $request->branch_name,
            'routing_number' => $request->routing_number,
            'payment_instructions' => $request->payment_instructions,
        ]);

        return response()->json('Payment gateway created successfully', 201);
    }

    // Show a single payment gateway
    public function show($id)
    {
        $company = Auth::user();
        $gateway = PaymentGateway::byCompany($company)->where('id', $id)->first();

        if (!$gateway) {
            return response()->json('Payment gateway not found', 404);
        }

        return response()->json($gateway);
    }

    // Update a payment gateway
    public function update(Request $request, $id)
    {
        $company = Auth::user();
        $gateway = PaymentGateway::byCompany($company)->where('id', $id)->first();

        if (!$gateway) {
            return response()->json('Payment gateway not found', 404);
        }
        $company_id = $company->company_id; 
       
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:payment_gateways,name,' . $id . ',id,company_id,' .$company_id,
            'logo_url' => 'required|url',
            'type' => 'required|in:mobile_bank,bank',
            'theme_color' => 'required|string',
            'receiver_number' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'account_name' => 'nullable|string',
            'account_number' => 'nullable|string',
            'branch_name' => 'nullable|string',
            'routing_number' => 'nullable|string',
            'payment_instructions' => 'required|string',
        ]);

        if ($validator->fails()) {
            return new JsonResponse($validator->errors(), 422);
        }

        $gateway->update($request->all());

        return response()->json('Payment gateway updated successfully');
    }

    // Delete a payment gateway
    public function destroy($id)
    {
        $company = Auth::user();
        $gateway = PaymentGateway::byCompany($company)->where('id', $id)->first();

        if (!$gateway) {
            return response()->json('Payment gateway not found', 404);
        }

        $gateway->delete();

        return response()->json('Payment gateway deleted successfully');
    }
}
