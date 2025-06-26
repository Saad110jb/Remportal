<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index()
    {
        $notifications = Notification::with(['user', 'sender'])->get();
        return response()->json($notifications);
    }

    /**
     * Store a newly created notification.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'sent_by' => 'nullable|exists:users,id',
            'type' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'message' => 'nullable|string',
            'via_email' => 'boolean',
            'via_sms' => 'boolean',
            'via_whatsapp' => 'boolean',
            'read_at' => 'nullable|date',
        ]);

        $notification = Notification::create($validated);

        return response()->json($notification, 201);
    }

    /**
     * Display the specified notification.
     */
    public function show(Notification $notification)
    {
        $notification->load(['user', 'sender']);
        return response()->json($notification);
    }

    /**
     * Update the specified notification.
     */
    public function update(Request $request, Notification $notification)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|required|exists:users,id',
            'sent_by' => 'nullable|exists:users,id',
            'type' => 'sometimes|required|string|max:255',
            'title' => 'sometimes|required|string|max:255',
            'message' => 'nullable|string',
            'via_email' => 'boolean',
            'via_sms' => 'boolean',
            'via_whatsapp' => 'boolean',
            'read_at' => 'nullable|date',
        ]);

        $notification->update($validated);

        return response()->json($notification);
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(Notification $notification)
    {
        $notification->delete();
        return response()->json(null, 204);
    }
}
