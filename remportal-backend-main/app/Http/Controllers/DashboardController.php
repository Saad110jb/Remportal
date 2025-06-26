<?php

namespace App\Http\Controllers;

use App\Models\CompanyUser;
use App\Models\Flat;
use App\Models\Payment;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
  use App\Models\Employee;
use App\Models\Department;

class DashboardController extends Controller
{
  
public function hrDashboard()
{
    $userId = auth()->id(); // Get logged-in user's ID

    $employeeCount = Employee::where('user_id', $userId)->count();
    $departmentCount = Department::where('user_id', $userId)->count(); // Ensure departments table has user_id

    return response()->json([
        'employee_count' => $employeeCount,
        'department_count' => $departmentCount,
    ]);
}

}
