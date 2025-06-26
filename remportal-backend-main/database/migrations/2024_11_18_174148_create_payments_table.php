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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('flat_id')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();

            $table->mediumText('type')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('frequency')->nullable(); // E.g., '15 days', '1 month'
            $table->date('next_payment_date')->nullable();
            $table->date('payment_date')->nullable();
            $table->text('description')->nullable();
            $table->mediumText('reference')->nullable();
            $table->mediumText('payment_link_token', 100)->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('token')->nullable();
            $table->string('attachment')->nullable();
            $table->string('payment_method')->nullable();
            $table->enum('status', ['pending', 'paid', 'overdue','completed'])->default('pending');
            $table->timestamps();

            $table->foreign('flat_id')->references('id')->on('flats')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('company_users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
