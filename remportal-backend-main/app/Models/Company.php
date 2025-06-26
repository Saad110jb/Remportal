<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;


class Company extends Model
{
    use HasFactory;
    protected $fillable = ["name","subscription_ends_at","status"];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // public function customers()
    // {
    //     return $this->hasMany(Customer::class);
    // }
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->subscription_ends_at && now()->lessThan($this->subscription_ends_at);
    }
    public function hasActiveSubscription(): bool
    {
        return $this->subscription_ends_at && now()->lessThan($this->subscription_ends_at);
    }
    public function extendSubscription($months)
    {
        $newDate = now()->addMonths($months);
        $this->subscription_ends_at = $newDate;
        $this->status = 'active';
        $this->save();
    }
    public function subscriptionRemaining()
    {
        if (!$this->subscription_ends_at) {
            return 'No active subscription';
        }

        $now = Carbon::now();
        $end = Carbon::parse($this->subscription_ends_at);

        if ($now->greaterThan($end)) {
            return 'Subscription expired';
        }

        $diff = $now->diff($end);

        if ($diff->y > 0) {
            return "{$diff->y} year(s), {$diff->m} month(s), {$diff->d} day(s) left";
        } elseif ($diff->m > 0) {
            return "{$diff->m} month(s), {$diff->d} day(s) left";
        } else {
            return "{$diff->d} day(s) left";
        }
    }
// In User.php
public function addons()
{
    return $this->belongsToMany(AddonSetting::class, 'addon_user', 'user_id', 'addon_id');
}

}