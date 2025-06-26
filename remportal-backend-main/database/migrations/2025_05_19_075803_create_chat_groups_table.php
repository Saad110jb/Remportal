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
        Schema::create('chat_groups', function (Blueprint $table) {
            $table->id();

            // Optional fields
            $table->string('name')->nullable(); // e.g., "Tenant Group - Project A"
            $table->string('type')->default('custom'); // e.g., tenant, admin, hr, custom
            $table->unsignedBigInteger('created_by')->nullable(); // user_id who created the group

            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        // Optional: Chat group membership table
        Schema::create('chat_group_user', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('chat_group_id');
            $table->unsignedBigInteger('user_id');

            $table->timestamps();

            $table->foreign('chat_group_id')->references('id')->on('chat_groups')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['chat_group_id', 'user_id']); // Prevent duplicate members
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_group_user');
        Schema::dropIfExists('chat_groups');
    }
};
