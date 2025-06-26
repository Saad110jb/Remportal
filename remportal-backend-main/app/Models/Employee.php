<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    // Fields that can be mass-assigned
    protected $fillable = [
          'name',      
        'user_id',
        'department_id',
        'designation',
        'phone',
        'email',
        'emergency_contact',
        'joining_date',
        'salary',
        'status',
    ];
     public $timestamps = true;

    // Casts
    protected $casts = [
        'joining_date' => 'date',
        'salary' => 'decimal:2',
    ];

    // Relationships

    /**
     * Get the user record associated with the employee.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
public function attendances()
{
    return $this->hasMany(Attendence::class);
}
    /**
     * Get the department the employee belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
