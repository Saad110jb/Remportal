<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;

class CompanyUser extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'uid', // UUID
        'company_id',
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'address',  
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Optional: define relationship to company
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // You can add scopes like these if you're using them in your controller
    public function scopeByCompany($query, $user)
    {
        return $query->where('company_id', $user->company_id);
    }

    public function scopeCustomers($query)
    {
        return $query->role('customer');
    }

    public function scopeEmployees($query)
    {
        return $query->role('employee');
    }

    public function scopeAdmins($query)
    {
        return $query->role('Company Admin');
    }
}
