<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Mail\ComplaintMail;
use Illuminate\Support\Facades\Log;

class ComplaintController extends Controller
{
    /**
     * Display a listing of all complaints.
     */
    public function index(Request $request): JsonResponse
{
    $query = Complaint::with('user')->orderByDesc('created_at');

    if ($search = $request->query('search')) {
        $query->where('subject', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%");
    }

    $complaints = $query->limit(2)->get();

    return response()->json(compact('complaints'), 200);
}


    /**
     * Store a new complaint and send an email.
     */
    public function store(Request $request): JsonResponse
    {
        Log::info('Complaint submission request received.', $request->all());

        $validator = Validator::make($request->all(), [
            'user_id'     => 'required|exists:users,id',
            'subject'     => 'required|string|max:255',
            'description' => 'required|string',
            'status'      => 'in:pending,in_progress,resolved',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for complaint submission.', $validator->errors()->toArray());
            return response()->json($validator->errors(), 422);
        }

        $user = User::find($request->user_id);
        if (!$user) {
            Log::error("User not found with ID: {$request->user_id}");
            return response()->json(['message' => 'User not found.'], 404);
        }

        $creator = User::find($user->created_by);
        if (!$creator) {
            Log::error("Creator not found for user ID: {$user->id}");
            return response()->json(['message' => 'Creator not found.'], 404);
        }

        $creatorEmail = trim($creator->email);
        if (!filter_var($creatorEmail, FILTER_VALIDATE_EMAIL)) {
            Log::error("Invalid creator email: '{$creatorEmail}'");
            return response()->json(['message' => 'Creator email is invalid.'], 404);
        }

        $complaint = Complaint::create([
            'user_id'     => $user->id,
            'subject'     => $request->subject,
            'description' => $request->description,
            'status'      => $request->status ?? 'pending',
        ]);
Log::info('Sending mail to creator', [
    'creator_email' => $creatorEmail,
    'complaint_data' => $complaint->toArray(),
    'user' => $complaint->user->toArray(),
]);

        try {
            Mail::to($creatorEmail)->send(new ComplaintMail($complaint));
            Log::info("Complaint email sent to creator: {$creatorEmail}");
        } catch (\Exception $e) {
            Log::error("Failed to send complaint email to {$creatorEmail}. Error: " . $e->getMessage());
        }

        return response()->json([
            'message'   => 'Complaint submitted and email sent to creator.',
            'complaint' => $complaint,
        ], 201);
    }

    /**
     * Show a specific complaint.
     */
    public function show($id): JsonResponse
    {
        $complaint = Complaint::with('user')->find($id);

        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        return response()->json(compact('complaint'));
    }

    /**
     * Update the complaint status or details.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $complaint = Complaint::find($id);
        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'subject'     => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status'      => 'in:pending,in_progress,resolved',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $complaint->update($request->only(['subject', 'description', 'status']));

        return response()->json([
            'message'   => 'Complaint updated successfully.',
            'complaint' => $complaint,
        ]);
    }

    /**
     * Delete a complaint.
     */
    public function destroy($id): JsonResponse
    {
        $complaint = Complaint::find($id);
        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        $complaint->delete();
        return response()->json(['message' => 'Complaint deleted successfully.']);
    }
}
