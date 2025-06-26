<?php

namespace App\Models;

use App\Traits\ForUserScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    use HasFactory,ForUserScope;

    protected $fillable = [
        'company_id',
        'name',
        'logo_url',
        'type',
        'theme_color',
        'receiver_number',
        'bank_name',
        'account_name',
        'account_number',
        'branch_name',
        'routing_number',
        'payment_instructions'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
