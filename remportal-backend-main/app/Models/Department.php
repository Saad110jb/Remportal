<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    // Fillable fields
      protected $fillable = [
        'company_id',
        'name',
        'head_id',
        'user_id',
    ];

    /**
     * Get the company that owns the department.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the employee who is the head of the department.
     */
    public function head()
    {
        return $this->belongsTo(Employee::class, 'head_id');
    }

    /**
     * Get the employees under this department.
     */
    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
