<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NoticeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $title;
    public $messageBody;
    public $replyToEmail;
    public $replyToName;

    public function __construct(array $data)
    {
        $this->title = $data['title'] ?? 'Notice';
        $this->messageBody = $data['messageBody'] ?? '';
        $this->replyToEmail = $data['replyToEmail'] ?? 'noreply@yourdomain.com';
        $this->replyToName = $data['replyToName'] ?? 'REM Portal';
    }

    public function build()
    {
        return $this->from('noreply@yourdomain.com', 'REM Portal')
                    ->replyTo($this->replyToEmail, $this->replyToName)
                    ->subject($this->title)
                    ->view('emails.notice')
                    ->with([
                        'title' => $this->title,
                        'messageBody' => $this->messageBody,
                    ]);
    }
}
