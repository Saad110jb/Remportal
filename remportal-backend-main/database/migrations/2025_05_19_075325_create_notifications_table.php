<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            // User receiving the notification
            $table->unsignedBigInteger('user_id');

            // Optional sender or related actor
            $table->unsignedBigInteger('sent_by')->nullable();

            // Notification type and content
            $table->string('type'); // e.g., 'payment_due', 'lease_expiry', 'complaint_reply'
            $table->string('title');
            $table->text('message')->nullable();

            // Delivery channels
            $table->boolean('via_email')->default(false);
            $table->boolean('via_sms')->default(false);
            $table->boolean('via_whatsapp')->default(false);

            // Read status
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('sent_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
