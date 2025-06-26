<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan',
        'start_date',
        'end_date',
        'is_active',
        'company_id', // ✅ Support for mass assignment
    ];

    /**
     * Get the user that owns the subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the company associated with the subscription.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
