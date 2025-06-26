<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FlatController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentGatewayController;
use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'subscription'])->group(function () {

    Route::controller(DashboardController::class)
        ->group(function () {
            Route::get('dashboard/statistics', 'statistics')->middleware('can:dashboard_statistics');
        });

    // customer, employee and company admin
    Route::controller(CompanyController::class)
        ->middleware('can:manage_my_users')
        ->group(function () {
            Route::get('/my-users', 'get_my_users');
            Route::post('/register-user', 'register_user');
        });
    // properties and flats
    Route::middleware(['can:manage_properties'])->prefix('properties')->controller(PropertyController::class)
        ->group(function () {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}',  'show');
            Route::put('/{id}',  'update');
            Route::delete('/{id}',  'destroy');
        });
    Route::middleware(['can:manage_flats'])->prefix('flats')->controller(FlatController::class)
        ->group(function () {
            Route::get('/',  'index');
            Route::post('/',  'store');
            Route::get('/{id}',  'show');
            Route::put('/{id}',  'update');
            Route::delete('/{id}',  'destroy');
        });
    Route::get('my-flats',[FlatController::class,'my_flats']);
    // notice
    Route::middleware(['can:manage_notice'])->prefix('notices')->controller(NoticeController::class)->group(function () {
        Route::post('/', 'store');
        Route::get('/', 'get_all_notices');
        Route::delete('/{id}',  'destroy');
    });
    Route::get('my-notices', [NoticeController::class, 'index']);
    // payments addon
    Route::middleware(['can:manage_payments'])->prefix('payment-gateways')->controller(PaymentGatewayController::class)
        ->group(function () {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });
    Route::controller(PaymentController::class)
    ->middleware('auth:sanctum')
    ->group(function () {
            Route::post('/create-payment', 'create_payment');
            Route::post('/verify-payment', 'verify_payment');
            Route::get('/payment/{secure_token}', 'show_payment');
            // permitted payment
            Route::get('/payments', 'get_payments')->middleware(['can:manage_payments']);
            Route::get('/flats/{flat_id}/payments', 'index')->middleware(['can:manage_payments']);
            Route::post('/flats/{flat_id}/payments', 'store')->middleware(['can:manage_payments']);
            Route::put('/payment/{id}', 'update_payment')->middleware(['can:manage_payments']);
            Route::delete('/payments/{id}',  'destroy')->middleware(['can:manage_payments']);
    });
    
    // documents 
    Route::prefix('documents')->controller(DocumentController::class)->group(function () {
        Route::post('/upload', 'upload')->middleware(['can:manage_documents']);
        Route::get('/all-doc', 'all_documents')->middleware(['can:manage_documents']);
        Route::delete('/{id}', 'destroy')->middleware(['can:manage_documents']);

        Route::get('/shared','sharedDocuments');
        Route::get('/download/{id}','download');
    });
});
