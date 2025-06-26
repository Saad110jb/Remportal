<?php

namespace App\Models;

use App\Traits\ForUserScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use HasFactory, ForUserScope;

    protected $table = 'notices';

    protected $fillable = [
        'company_id',
        'admin_id',       // This is the user_id of the admin creating the notice
        'target_type',
        'target_ids',
        'title',
        'message',
        'expires_at'
    ];

    protected $casts = [
        'target_ids' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Relationship: Notice belongs to a company
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Relationship: Notice belongs to an admin (user)
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
