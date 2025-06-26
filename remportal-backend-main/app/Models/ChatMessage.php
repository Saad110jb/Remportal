<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatMessage extends Model
{
    use HasFactory;

    protected $table = 'chat_messages'; // make sure table name is correct

    protected $fillable = [
        'group_id',
        'user_id',
        'message',
        'attachment',
    ];

    public function group()
    {
        return $this->belongsTo(ChatGroup::class, 'group_id');
    }

   public function user()
{
    return $this->belongsTo(User::class);
}

}
