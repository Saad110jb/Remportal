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
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();

            // Sender and group (chatroom or thread)
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('user_id');

            // Message content
            $table->text('message')->nullable();
            $table->string('attachment')->nullable(); // path to image, file, etc.

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('group_id')->references('id')->on('chat_groups')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
