<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'description',
        'status',
    ];

    /**
     * Relationship: Complaint belongs to a User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
