<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatGroup extends Model
{
    use HasFactory;
protected $table = 'chat_groups';
    protected $fillable = [
        'name',
        'type',
        'created_by',
    ];

    /**
     * The users that belong to this chat group.
     */
   public function users()
{
    // Specify pivot table and correct foreign keys
    return $this->belongsToMany(User::class, 'chat_group_user', 'chat_group_id', 'user_id')->withTimestamps();
}

    /**
     * The messages sent in this chat group.
     */
    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'group_id');
    }
    

    /**
     * The user who created the group.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
