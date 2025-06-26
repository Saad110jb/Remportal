<?php

namespace App\Models;

use App\Traits\ForUserScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, ForUserScope;

    protected $fillable = [
        'flat_id',
        'company_id',
        'bill_id',
        'customer_id',
        'type',
        'amount',
        'frequency',
        'next_payment_date',
        'payment_date',
        'description',
        'reference',
        'payment_link_token',
        'transaction_id',
        'token',
        'attachment',
        'payment_method',
        'method',
        'status',
    ];

    /** Relationships **/

    public function flat()
    {
        return $this->belongsTo(Flat::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    public function company()
    {
        return $this->belongsTo(CompanyUser::class, 'company_id');
    }

    /** Logic **/

    // Set the next payment date based on frequency
    public function setNextPaymentDate()
    {
        $frequency = $this->frequency;
        $nextPaymentDate = Carbon::now();

        if ($frequency === '1 month') {
            $nextPaymentDate = Carbon::now()->addMonth();
        } elseif ($frequency === '15 days') {
            $nextPaymentDate = Carbon::now()->addDays(15);
        } elseif ($frequency === '3 months') {
            $nextPaymentDate = Carbon::now()->addMonths(3);
        }

        $this->next_payment_date = $nextPaymentDate;
    }

    // Update payment status to "paid"
    public function markAsPaid()
    {
        $this->status = 'paid';
        $this->payment_date = Carbon::now();
        $this->save();
    }

    // Mark as overdue if next payment date passed
    public function checkForOverdue()
    {
        if ($this->next_payment_date && $this->next_payment_date->isPast() && $this->status !== 'paid') {
            $this->status = 'overdue';
            $this->save();
        }
    }
}
