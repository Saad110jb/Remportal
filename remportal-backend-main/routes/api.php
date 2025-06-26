<?php

use App\Http\Controllers\AddonController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Mail\NoticeMail;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RolesPermissionsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MailTemplateController;
use App\Http\Controllers\AttendenceController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CompanyUserController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\PaymentGatewayController;
use App\Http\Controllers\FlatController;
use App\Http\Controllers\Chat_groupsController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\Chat_messageController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Mail;

// Companies
Route::get('/companies', [CompanyController::class, 'index']);
Route::post('/register-company', [CompanyController::class, 'register']);
Route::post('/renew-company-subscription', [CompanyController::class, 'renew']);

// Company Users
Route::post('/register-company-user', [CompanyUserController::class, 'register']);
Route::get('/company-users', [CompanyUserController::class, 'index']);

// routes/api.php

use App\Http\Controllers\LeaseController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/indexleases', [LeaseController::class, 'index']);
    Route::post('/storeleases', [LeaseController::class, 'store']);
    Route::get('/showleases/{id}', [LeaseController::class, 'show']);
    Route::put('/updateleases/{id}', [LeaseController::class, 'update']);
    Route::delete('/destroyleases/{id}', [LeaseController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/my-customer', [CustomerController::class, 'myCustomer']);
Route::middleware('auth:sanctum')->get('/leases/by-customer/{customer_id}', [LeaseController::class, 'getLeasesByCustomerid']);

Route::middleware('auth:sanctum')->get('/my-customer', [CustomerController::class, 'getCustomerByUser']);
use App\Http\Controllers\ComplaintController;
Route::middleware('auth:sanctum')->get('/leases/by-creator-user', [LeaseController::class, 'getLeasesByCreatorUser']);
use App\Http\Controllers\BillController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bills', [BillController::class, 'index']); // For admin/owner
    Route::get('/my-bills', [BillController::class, 'myBills']); // For tenant
    Route::post('/bills', [BillController::class, 'store']); // Create new bill
    Route::put('/bills/{id}/paid', [BillController::class, 'markAsPaid']);
    Route::get('/bills/{id}', [BillController::class, 'show']);  
     Route::put('/bills/{id}', [BillController::class, 'update']); 
        Route::get('/by-creator', [BillController::class, 'billsByCreator']);
    Route::delete('/bills/{id}', [BillController::class, 'destroy']);
});



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/indexcomplaints', [ComplaintController::class, 'index']);
    Route::post('/storecomplaints', [ComplaintController::class, 'store']);
    Route::get('/showcomplaints/{id}', [ComplaintController::class, 'show']);
    Route::put('/updatecomplaints/{id}', [ComplaintController::class, 'update']);
    Route::delete('/deletecomplaints/{id}', [ComplaintController::class, 'destroy']);
});

// Notices
Route::middleware('auth:sanctum')->group(function () {

    // Create a new notice
    Route::post('/storenotices', [NoticeController::class, 'store']);

    // Get all notices created by a specific admin (pass ?admin_id= in query)
    Route::get('/shownotices', [NoticeController::class, 'index']);

    // Show a specific notice by ID
    Route::get('/notices/{notice}', [NoticeController::class, 'show']);

    // Update a specific notice
    Route::put('/notices/{notice}', [NoticeController::class, 'update']);

    // Delete a specific notice
    Route::delete('/notices/{id}', [NoticeController::class, 'destroy']);
});
// Payment Gateways
Route::get('/payment-gateways', [PaymentGatewayController::class, 'index']);
Route::post('/payment-gateways', [PaymentGatewayController::class, 'store']);
Route::get('/payment-gateways/{id}', [PaymentGatewayController::class, 'show']);
Route::put('/payment-gateways/{id}', [PaymentGatewayController::class, 'update']);
Route::delete('/payment-gateways/{id}', [PaymentGatewayController::class, 'destroy']);

// Payments

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/indexpayments', [PaymentController::class, 'index']);
    Route::get('/my-payments', [PaymentController::class, 'myPayments']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::post('/payments/{id}/mark-paid', [PaymentController::class, 'markAsPaid']);
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);
    Route::get('/payments/by-bill/{billId}', [PaymentController::class, 'getByBill']);
});

// Email Templates
Route::get('/email-templates', [MailTemplateController::class, 'get_all_templates']);
Route::get('/email-templates/{template_name}', [MailTemplateController::class, 'get_template']);
Route::put('/email-templates/{template_name}', [MailTemplateController::class, 'update_template']);

// Flats
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/indexflats', [FlatController::class, 'index']);
    Route::post('/addflats', [FlatController::class, 'store']);
    Route::get('/flats/my', [FlatController::class, 'my_flats']);
    Route::get('/showflats/{id}', [FlatController::class, 'show']);
    Route::put('/updateflats/{id}', [FlatController::class, 'update']);
    Route::delete('/deleteflats/{id}', [FlatController::class, 'destroy']);
});

// Chat Groups

  // Group APIs
Route::middleware('auth:sanctum')->group(function () {

    // ✅ Chat Group Routes
    Route::get('/chat/groups', [Chat_groupsController::class, 'myGroups']);
    Route::post('/chat/groups', [Chat_groupsController::class, 'store']);
    Route::post('/chat/groups/{groupId}/add-user', [Chat_groupsController::class, 'addUser']);
    Route::post('/chat/groups/{groupId}/remove-user', [Chat_groupsController::class, 'removeUser']);
Route::delete('/chat-messages/{id}', [Chat_messageController::class, 'destroy']);

    // ✅ Chat Addon Availability Check
    Route::get('/chat/support-check', [Chat_groupsController::class, 'hasChatSupport']);
Route::post('/check-expired-subscription', [AddonController::class, 'expireAddonsIfSubscriptionExpired']);

    // ✅ Chat Messages
    Route::get('/chat-messages/{groupId}', [Chat_messageController::class, 'index']);
    Route::post('/chat-messages', [Chat_messageController::class, 'store']);
});
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\SubscriptionController;

Route::middleware(['auth:sanctum'])->get('/property-income', [IncomeController::class, 'getOwnerIncome']);
Route::middleware(['auth:sanctum'])->get('/leases-by-creator', [LeaseController::class, 'getLeasesByCreator']);

// Budgets
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/budgets', [BudgetController::class, 'index']);
    Route::post('/budgets', [BudgetController::class, 'store']);
    Route::get('/budgets/{budget}', [BudgetController::class, 'show']);
    Route::put('/budgets/{budget}', [BudgetController::class, 'update']);
    Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy']);
});

// Attendance
Route::apiResource('attendances', AttendenceController::class);
Route::get('/attendances/employee/{employee_id}', [AttendenceController::class, 'getEmployeeAttendance']);

// Chat Messages
Route::get('/chat-messages', [Chat_messageController::class, 'index']);
Route::post('/chat-messages', [Chat_messageController::class, 'store']);
Route::get('/chat-messages/{chatMessage}', [Chat_messageController::class, 'show']);
Route::put('/chat-messages/{chatMessage}', [Chat_messageController::class, 'update']);
Route::delete('/chat-messages/{chatMessage}', [Chat_messageController::class, 'destroy']);

// Employees
Route::get('/employees', [EmployeeController::class, 'index']);
Route::post('/employees', [EmployeeController::class, 'store']);
Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

// PropertiesRoute::middleware('auth:sanctum')->get('/properties', [PropertyController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/indexproperties', [PropertyController::class, 'index']);
    Route::post('/storeproperties', [PropertyController::class, 'store']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);
    Route::put('/updateproperties/{id}', [PropertyController::class, 'update']);
    Route::delete('/deleteproperties/{id}', [PropertyController::class, 'destroy']);
});
// Users
Route::delete('/users/{id}', [AuthController::class, 'destroy']);
Route::middleware('auth:sanctum')->get('/users', [AuthController::class, 'index']);
Route::get('/my-created-customer', [CustomerController::class, 'getMyCreatedCustomer']);

Route::patch('/users/{id}', [AuthController::class, 'update']);
Route::get('/get-user/{id}', [UserController::class, 'get_user']);
Route::patch('/users/{id}/approve', [UserController::class, 'approve']);
Route::get('/get-users', [UserController::class, 'get_users']);

// Notifications
Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications', [NotificationController::class, 'store']);
Route::get('/notifications/{notification}', [NotificationController::class, 'show']);
Route::put('/notifications/{notification}', [NotificationController::class, 'update']);
Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

// Departments
Route::get('/departments', [DepartmentController::class, 'index']);
Route::post('/departments', [DepartmentController::class, 'store']);
Route::get('/departments/{department}', [DepartmentController::class, 'show']);
Route::put('/departments/{department}', [DepartmentController::class, 'update']);
Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

// Customers
Route::get('/customers', [CustomerController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'store']);
Route::get('/customers/{id}', [CustomerController::class, 'show']);
Route::put('/customers/{id}', [CustomerController::class, 'update']);
Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);
Route::get('/filtered-customers', [CustomerController::class, 'index1']);
// Auth
Route::middleware('auth:sanctum')->get('/mycustomers1', [CustomerController::class, 'getMyCustomers']);
Route::get('/creator-customers', [CustomerController::class, 'customersByCreator']);
Route::middleware('auth:sanctum')->get('/flats-by-owner', [FlatController::class, 'flatsByOwner']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-tenants', [UserController::class, 'myTenants']);
    Route::get('/my-properties', [PropertyController::class, 'myProperties']);
});

Route::get('/test-mail', function () {
    Mail::to('muhammad110jb@gmail.com')->send(new NoticeMail([
        'title' => 'Test Notice',
        'messageBody' => 'This is a working test email.'
    ]));

    return 'Email sent';
});


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->post('/change-password', [AuthController::class, 'changePassword']);
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/addons', [AddonController::class, 'index']);
    Route::post('/addons', [AddonController::class, 'store']);
        Route::post('/subscribe', [SubscriptionController::class, 'store']);
    Route::post('/assign-addons', [AddonController::class, 'assign']);


    Route::put('/addons/{id}', [AddonController::class, 'update']);
    Route::delete('/addons/{id}', [AddonController::class, 'destroy']);
});
Route::delete('/companies/{id}', [CompanyController::class, 'destroy']);


// HR Dashboard
Route::get('/hr-dashboard', [DashboardController::class, 'hrDashboard']);

// Settings
Route::get('/settings', [SettingsController::class, 'index']);
Route::post('/settings', [SettingsController::class, 'update']);
Route::get('/get-email-settings', [SettingsController::class, 'getEmailSettings']);
Route::post('/update-email-settings', [SettingsController::class, 'updateEmailSettings']);

// Mail Templates
Route::get('mail/all-templates', [MailTemplateController::class, 'get_all_templates']);
Route::get('mail/{template_name}', [MailTemplateController::class, 'get_template']);
Route::put('mail/update/{template_name}', [MailTemplateController::class, 'update_template']);

// Test
Route::post('/test-public', function () {
    return response()->json(['status' => 'OK']);
});

// Migration Helpers
Route::get('/migrate-database', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('db:seed', ['--class' => 'RolesAndPermissionsSeeder', '--force' => true]);
        Artisan::call('db:seed', ['--class' => 'DatabaseSeeder', '--force' => true]);

        return response()->json(['message' => 'Migrations executed successfully!'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/migrate-refresh', function () {
    try {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Artisan::call('migrate:refresh', ['--force' => true]);
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Artisan::call('db:seed', ['--class' => 'RolesAndPermissionsSeeder', '--force' => true]);
        Artisan::call('db:seed', ['--class' => 'DatabaseSeeder', '--force' => true]);

        return response()->json([
            'message' => 'Migrations refreshed successfully without foreign key checks!',
            'output' => Artisan::output(),
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
