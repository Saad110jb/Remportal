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
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();

            // Foreign key to employees table
            $table->unsignedBigInteger('employee_id');

            // Attendance date and status
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'leave'])->default('present');

            $table->timestamps();

            // Foreign key constraint
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');

            // Ensure no duplicate entries for the same employee on the same date
            $table->unique(['employee_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
