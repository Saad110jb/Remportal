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
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id'); // This will store the created_by value

            $table->string('subject');
            $table->text('description');
            $table->enum('status', ['pending', 'in_progress', 'resolved'])->default('pending');

            $table->timestamps();

            // DO NOT add foreign key constraint since created_by is not a unique/primary key
            // You can add an index if needed
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
