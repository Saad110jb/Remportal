<?php 
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;

class ConfigServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }
    public function boot()
    {
        if (!app()->runningInConsole() && Schema::hasTable('settings')) {
            // Fetch email settings from the database
            $emailServices = [
                'status' => get_setting('email_status') ?? 1,
                'driver' => get_setting('email_driver') ?? env('MAIL_MAILER', 'smtp'),
                'host' => get_setting('email_host') ?? env('MAIL_HOST', 'smtp.mailtrap.io'),
                'port' => get_setting('email_port') ?? env('MAIL_PORT', 587),
                'username' => get_setting('email_username') ?? env('MAIL_USERNAME', 'example'),
                'password' => get_setting('email_password') ?? env('MAIL_PASSWORD', 'password'),
                'encryption' => get_setting('email_encryption') ?? env('MAIL_ENCRYPTION', 'tls'),
                'email_id' => get_setting('email_id') ?? env('MAIL_FROM_ADDRESS', 'no-reply@example.com'),
                'name' => get_setting('email_name') ?? env('MAIL_FROM_NAME', 'Example'),
            ];
    
            $config = array(
                'driver' => $emailServices['driver'],
                'host' => $emailServices['host'],
                'port' => $emailServices['port'],
                'username' => $emailServices['username'],
                'password' => $emailServices['password'],
                'encryption' => $emailServices['encryption'],
                'from' => [
                    'address' => $emailServices['email_id'],
                    'name' => $emailServices['name']
                ],
                'sendmail' => '/usr/sbin/sendmail -bs',
                'pretend' => false,
            );
    
            // Dynamically set the mail configuration
            Config::set('mail', $config);
        }
    }
    

}