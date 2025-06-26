<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ChatGroupUser extends Pivot
{
    protected $table = 'chat_group_user';

    protected $fillable = [
        'chat_group_id',
        'user_id',
    ];
    public function users()
{
    return $this->belongsToMany(User::class, 'ChatGroup_users', 'chat_group_id', 'user_id');
}
    public function chatGroup()
    {
        return $this->belongsTo(ChatGroup::class, 'chat_group_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }   
}
