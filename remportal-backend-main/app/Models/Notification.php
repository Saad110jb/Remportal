<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'sent_by',
        'type',
        'title',
        'message',
        'via_email',
        'via_sms',
        'via_whatsapp',
        'read_at',
    ];

    protected $casts = [
        'via_email' => 'boolean',
        'via_sms' => 'boolean',
        'via_whatsapp' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * User who receives the notification
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * User who sent the notification (optional)
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    /**
     * Check if notification is read
     */
    public function isRead()
    {
        return !is_null($this->read_at);
    }
}
