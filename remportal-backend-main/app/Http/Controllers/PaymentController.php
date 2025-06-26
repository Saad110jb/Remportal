<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PaymentController extends Controller
{
    // List all payments (for admin/company)
public function index(Request $request)
{
    $customerId = $request->query('customer_id');

    if (!$customerId) {
        return response()->json(['message' => 'Missing customer_id'], 400);
    }

    $customer = Customer::find($customerId);

    if (!$customer) {
        return response()->json(['message' => 'Customer not found'], 404);
    }

    $payments = Payment::with(['customer', 'flat', 'bill', 'company'])
        ->where('customer_id', $customerId)
        ->latest()
        ->get();

    return response()->json(['payments' => $payments]);
}


    // List payments made by the authenticated tenant (customer)
    public function myPayments(Request $request)
    {
        $user = $request->user();

        $customer = Customer::where('email', $user->email)->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $payments = Payment::with(['flat', 'bill'])
            ->where('customer_id', $customer->id)
            ->latest()
            ->get();

        return response()->json(['payments' => $payments]);
    }

    // Store a new payment
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bill_id'       => 'nullable|exists:bills,id',
            'flat_id'       => 'nullable|exists:flats,id',
            'company_id'    => 'nullable|exists:company_users,id',
            'customer_id'   => 'required|exists:customers,id',
            'amount'        => 'required|numeric|min:0',
            'method'        => 'nullable|string|max:255',
            'reference'     => 'nullable|string|max:255',
            'description'   => 'nullable|string',
            'frequency'     => 'nullable|string',
            'payment_method'=> 'nullable|string',
            'status'        => 'nullable|in:pending,paid,overdue,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::create([
            'bill_id'       => $request->bill_id,
            'flat_id'       => $request->flat_id,
            'company_id'    => $request->company_id,
            'customer_id'   => $request->customer_id,
            'amount'        => $request->amount,
            'method'        => $request->method,
            'reference'     => $request->reference,
            'description'   => $request->description,
            'payment_method'=> $request->payment_method,
            'frequency'     => $request->frequency,
            'status'        => $request->status ?? 'pending',
            'payment_date'  => Carbon::now(),
        ]);

        $payment->setNextPaymentDate();
        $payment->save();

        return response()->json(['message' => 'Payment created successfully', 'payment' => $payment]);
    }

    // Mark a payment as paid
    public function markAsPaid($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->markAsPaid();

        return response()->json(['message' => 'Payment marked as paid']);
    }

    // Delete a payment
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    // Get payments for a specific bill
    public function getByBill($billId)
    {
        $payments = Payment::with(['customer', 'flat'])
            ->where('bill_id', $billId)
            ->get();

        return response()->json(['payments' => $payments]);
    }
}
