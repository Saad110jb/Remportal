<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendence extends Model
{
    use HasFactory;

    // Fillable fields
    protected $fillable = [
        'employee_id',
        'date',
        'status',
    ];
protected $table = 'attendance';
    // Cast date to Carbon instance
    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the employee associated with this attendance.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
