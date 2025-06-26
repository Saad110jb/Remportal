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
    Schema::create('bills', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('customer_id');
        $table->unsignedBigInteger('lease_id')->nullable();
        $table->decimal('amount', 12, 2);
        $table->string('description')->nullable();
        $table->date('due_date');
        $table->enum('status', ['unpaid', 'paid', 'overdue'])->default('unpaid');
        $table->unsignedBigInteger('created_by')->nullable();
        $table->timestamps();

        $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
        $table->foreign('lease_id')->references('id')->on('leases')->onDelete('set null');
        $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
