<?php

namespace App\Models;
use App\Models\AddonSetting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;
use Spatie\Permission\Traits\HasRoles;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
class User extends Authenticatable
{
    use HasRoles, HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guard_name = 'sanctum';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'created_by', // added 'role' attribute as per migration
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * The relationship between the user and companies.
     */
    public function companies()
    {
        return $this->hasMany(Company::class);
    }
public function hasCompanyAddon(string $addonName): bool
{
    if (!in_array($this->role, ['tenant', 'customer'])) return true;

    $company = $this->customer?->company;
    if (!$company) return false;

    return $company->addons()->where('name', $addonName)->exists();
}


    public function complaints()
{
    return $this->hasMany(Complaint::class, 'user_id', 'created_by'); // if you want to relate via created_by
}
public function chatGroups()
{
    return $this->belongsToMany(ChatGroup::class, 'chat_group_user', 'user_id', 'chat_group_id')->withTimestamps();
}

public function properties()
{
    return $this->hasMany(Property::class);
}
public function customer()
{
    return $this->belongsTo(\App\Models\Customer::class, 'created_by', 'user_id');
}
public function company()
{
    return $this->customer ? $this->customer->company() : null;
}

    /**
     * The relationship between the user and the flat.
     */
    public function flat()
    {
        return $this->belongsTo(Flat::class, 'flat_id', 'id')->select('id', 'name', 'price', 'property_id');
    }

    /**
     * The relationship between the user and the property.
     */
    public function property()
    {
        return $this->belongsTo(Property::class)->select('id', 'name', 'address');
    }

    /**
     * The relationship between the user and payments.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Accessor for avatar URL.
     */
    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset($this->avatar) : null;
    }

    /**
     * Send password reset notification.
     *
     * @param string $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Boot method to handle custom ID generation and other boot processes.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            // Custom ID generation logic can be added here, if necessary
            // Example: auto-generate a custom user ID
        });
    }
}
