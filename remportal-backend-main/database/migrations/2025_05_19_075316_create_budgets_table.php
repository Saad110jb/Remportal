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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();

            // Link to company (for multi-tenant SaaS)
            $table->unsignedBigInteger('company_id')->nullable();

            // Optional project-wise budgeting (if project table exists)

            // Budget fields
            $table->enum('type', ['daily', 'monthly', 'half_yearly', 'yearly']);
            $table->date('date'); // Represents the period start (e.g., for daily/monthly)
            $table->decimal('amount', 15, 2);
            $table->string('category')->nullable(); // E.g., 'Maintenance', 'Salaries', 'Marketing'
            $table->text('notes')->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
         });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
