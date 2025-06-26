<?php

namespace App\Mail;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ComplaintMail extends Mailable
{
    use Queueable, SerializesModels;

    public $complaint;

    public function __construct(Complaint $complaint)
    {
        // Load the user relation if not loaded
        $complaint->loadMissing('user');
        $this->complaint = $complaint;
    }

    public function build()
    {
        return $this->subject('New Complaint Submitted')
            ->view('emails.complaint')
            ->with([
                'complaint' => $this->complaint,
            ]);
    }
}
