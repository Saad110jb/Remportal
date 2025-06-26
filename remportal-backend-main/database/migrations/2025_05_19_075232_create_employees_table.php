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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('department_id')->nullable();

            // Employee details
            $table->string('designation')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->date('joining_date')->nullable();
            $table->decimal('salary', 15, 2)->nullable();
            $table->string('status')->default('active'); // active, inactive, resigned, terminated

            // Timestamps
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
