<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailTemplate extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $subject;
    public $body;
    protected $placeholders;
    public function __construct($template,$placeholders = [])
    {
        $this->subject = $template->subject;
        $this->body = $this->replacePlaceholders($template->body, $placeholders);
        $this->placeholders = $placeholders;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.template',
            with : [
                'subject' => $this->subject,
                'body' => $this->body,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
    private function replacePlaceholders($template, $placeholders)
    {
        foreach ($placeholders as $key => $value) {
            $template = str_replace("{{$key}}", $value, $template);
        }

        return $template;
    }
}
