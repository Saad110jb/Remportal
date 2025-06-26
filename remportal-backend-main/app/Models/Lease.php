<?php
// app/Models/Lease.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lease extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'property_id',
        'flat_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'status',
        'created_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class); // tenant
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }
    public function payments()
{
    return $this->hasMany(Payment::class);
}

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

}
