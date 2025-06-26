<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\NoticeMail;
use Illuminate\Support\Facades\Log;

class NoticeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $adminId = $request->admin_id ?? $request->query('admin_id');

        if (!$adminId) {
            return response()->json(['message' => 'admin_id is required.'], 400);
        }

        $notices = Notice::with(['company', 'admin'])
            ->where('admin_id', $adminId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($notices);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'admin_id'     => 'required|exists:users,id',
            'company_id'   => 'required|exists:companies,id',
            'title'        => 'required|string|max:255',
            'message'      => 'required|string',
            'target_type'  => 'required|in:customer,employee,both,specific',
            'target_ids'   => 'nullable|array',
            'expires_at'   => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $admin = User::find($request->admin_id);

        $targetUsers = $request->target_type === 'specific'
            ? User::whereIn('id', $request->target_ids ?? [])->get()
            : $this->getTargetUsers($request->target_type, $request->admin_id);

        if ($targetUsers->isEmpty()) {
            return response()->json(['message' => 'No users found for email.'], 404);
        }

        $notice = Notice::create([
            'company_id'  => $request->company_id,
            'admin_id'    => $request->admin_id,
            'target_type' => $request->target_type,
            'target_ids'  => $targetUsers->pluck('id')->toArray(),
            'title'       => $request->title,
            'message'     => $request->message,
            'expires_at'  => $request->expires_at,
        ]);

        foreach ($targetUsers as $user) {
            if ($user && filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                Log::info("📧 Preparing to send email to: {$user->email}");

                try {
                    $mailData = [
                        'title'        => $request->title,
                        'messageBody'  => $request->message,
                        'replyToEmail' => $admin->email ?? 'noreply@yourdomain.com',
                        'replyToName'  => $admin->name ?? 'Admin',
                    ];

                    Mail::to($user->email)->send(new NoticeMail($mailData));
                    Log::info("✅ Email sent to: {$user->email}");
                } catch (\Exception $e) {
                    Log::error("❌ Failed to send email to {$user->email}", [
                        'exception' => $e->getMessage(),
                        'mailData' => $mailData,
                    ]);
                }
            } else {
                Log::warning("⚠️ Invalid or missing email for user ID: {$user->id}");
            }
        }

        return response()->json([
            'message' => 'Notice created and emails sent.',
            'notice'  => $notice,
        ], 201);
    }

    // ✅ Get employees/customers/both based on target_type
    protected function getTargetUsers(string $type, int $adminId)
    {
        $query = User::query()->where('created_by', $adminId);

        if ($type === 'employee') {
            return $query->where('role', 'employee')->get();
        }

        if ($type === 'customer') {
            return $query->whereIn('role', ['customer', 'tenant'])->get();
        }

        if ($type === 'both') {
            return $query->whereIn('role', ['employee', 'customer', 'tenant'])->get();
        }

        return collect(); // fallback
    }

    public function show(Notice $notice): JsonResponse
    {
        $notice->load(['company', 'admin']);
        return response()->json($notice);
    }

    public function update(Request $request, Notice $notice): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'      => 'sometimes|required|string|max:255',
            'message'    => 'sometimes|required|string',
            'expires_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $notice->update($request->only('title', 'message', 'expires_at'));

        return response()->json([
            'message' => 'Notice updated successfully.',
            'notice'  => $notice,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $notice = Notice::find($id);

        if (!$notice) {
            return response()->json(['message' => 'Notice not found.'], 404);
        }

        $notice->delete();

        return response()->json(['message' => 'Notice deleted successfully.']);
    }
}
