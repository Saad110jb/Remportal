<?php

namespace App\Services;

use App\Mail\EmailTemplate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailService
{
    static public function sendMailWithTemplate($email, $template_name, $placeholders)
    {
        try {
            $template = DB::table('email_templates')->where('template_name', $template_name)->first();
            if (!$template) {
                throw new \Exception("Template not found");
            }
            Mail::to($email)->send(new EmailTemplate($template, $placeholders));
        } catch (\Throwable $th) {
            Log::error("Failed to send email: " . $th->getMessage());
        }
    }
}
