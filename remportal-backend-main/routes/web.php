<?php

    use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\NoticeMail;

/*
|--------------------------------------------------------------------------
| Web Routes    
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return app()->version();



});
Route::get('/test-mail', function () {
    Mail::to('muhammad110jb@gmail.com')->send(new NoticeMail([
        'title' => 'Test Notice',
        'messageBody' => 'This is a working test email.'
    ]));

    return '✅ Email sent (check logs and inbox)';
});
