<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AddonSetting extends Model
{
    use HasFactory;

    protected $table = 'addons';

    protected $fillable = [
        'name',
        'price',
        'description',
        'company_id', // ✅ Add this to support mass assignment
    ];

    /**
     * The users that belong to the addon (many-to-many).
     */
     public function users()
    {
        return $this->belongsToMany(User::class, 'addon_user', 'addon_id', 'user_id');
    }

    /**
     * The company this addon belongs to.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    protected static function booted()
    {
        static::saved(function () {
            Cache::clear();
        });

        static::updated(function () {
            Cache::clear();
        });

        static::deleted(function () {
            Cache::clear();
        });
    }
}
