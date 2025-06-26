<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'owner_id',
        'name',
        'location',
        'description',
        'price',
        'status',
        'property_for',
        'type',
        'user_id', // ✅ Must be here
    ];

    public function flats()
    {
        return $this->hasMany(Flat::class);
    }
    public function user()
{
    return $this->belongsTo(User::class);
}

public function leases()
{
    return $this->hasMany(Lease::class);
}
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
