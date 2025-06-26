<?php

namespace App\Http\Controllers;

use App\Models\ChatGroup;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;

class Chat_messageController extends Controller
{
    /**
     * Fetch messages for a group, decrypting the message content.
     */
   public function index($groupId): JsonResponse
{
    $messages = ChatMessage::with('user')
        ->where('group_id', $groupId)
        ->latest()
        ->take(100)
        ->get()
        ->reverse()
        ->values();

    $decryptedMessages = $messages->map(function ($msg) {
        if ($msg->message) {
            try {
                $msg->message = Crypt::decryptString($msg->message);
            } catch (\Exception $e) {
                $msg->message = '[Message Decryption Failed]';
            }
        }
        return $msg;
    });

    return response()->json([
        'messages' => $decryptedMessages,
    ]);
}


    /**
     * Store a new message, encrypting the message content.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'group_id'   => 'required|exists:chat_groups,id',
            'user_id'    => 'nullable|exists:users,id',
            'message'    => 'nullable|string',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,docx,txt|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = [
            'group_id' => $request->group_id,
            'user_id'  => $request->user_id ?? null,
            'message'  => $request->message ? Crypt::encryptString($request->message) : null,
        ];

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $data['attachment'] = $path;
        }

        $msg = ChatMessage::create($data);

        // Decrypt message for response
        if ($msg->message) {
            try {
                $msg->message = Crypt::decryptString($msg->message);
            } catch (\Exception $e) {
                $msg->message = '[Message Decryption Failed]';
            }
        }

        return response()->json([
            'message' => 'Message sent',
            'data' => $msg->load('user'),
        ]);
    }

    /**
     * Delete a chat message by ID.
     */
   public function destroy($id, Request $request): JsonResponse
{
    $userId = $request->user_id;

    $message = ChatMessage::find($id);
    if (!$message) {
        return response()->json(['error' => 'Message not found.'], 404);
    }

    $user = \App\Models\User::find($userId); // Make sure to import User model
    if (!$user) {
        return response()->json(['error' => 'User not found.'], 404);
    }

    // ✅ Allow sender or admin to delete
    $isAdmin = $user->role === 'admin'; // assuming 'role' column
    if ($message->user_id !== (int) $userId && !$isAdmin) {
        return response()->json(['error' => 'Unauthorized to delete this message.'], 403);
    }

    $message->delete();

    return response()->json(['message' => 'Message deleted successfully.']);
}

}
