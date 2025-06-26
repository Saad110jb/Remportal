<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'customer_id', 'lease_id', 'amount', 'description',
        'due_date', 'status', 'created_by'
    ];

    // Relationships
    public function lease()
{
    return $this->belongsTo(Lease::class);
}

public function customer()
{
    return $this->belongsTo(Customer::class);
}

public function creator()
{
    return $this->belongsTo(User::class, 'created_by');
}

public function payments()
{
    return $this->hasMany(Payment::class);
}

}
