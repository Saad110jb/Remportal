<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    protected $table = 'budgets';

    protected $fillable = [
        'company_id',
        'user_id',           // ✅ Add user_id to fillable
        'type',
        'date',
        'amount',
        'category',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the company that owns the budget.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the user who created or owns the budget.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
