<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    protected function resetUrl($notifiable)
    {
        // Use $notifiable->email to get the email address of the user.
        return url("http://localhost:3000/reset-password?token={$this->token}&email={$notifiable->email}");
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Reset Password Notification')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $this->resetUrl($notifiable))
            ->line('If you did not request a password reset, no further action is required.');
    }
}
