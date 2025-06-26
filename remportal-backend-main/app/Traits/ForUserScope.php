<?php 
namespace App\Traits;

trait ForUserScope
{
    public function scopeForUser($query, $user)
    {
        if (!$user->hasRole('Director')) {
            $query->where('company_id', $user->company_id);
        }

        return $query;
    }
    public function scopeByCompany($query, $user)
    {
        if (!$user->hasRole('Director')) {
            $query->where('company_id', $user->company_id);
        }

        return $query;
    }
}
