<?php

namespace App\Models;

use App\Traits\ForUserScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flat extends Model
{
    use HasFactory;
    protected $fillable = [
        'company_id','property_id','owner_id', 'name', 'size', 'price', 'address',
        'bedrooms', 'bathrooms', 'kitchen', 'balcony', 'status','type','is_running'
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    public function owner()
    {
        return $this->belongsTo(CompanyUser::class, 'owner_id');
    }
}
