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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('company_id');
            $table->unsignedBigInteger('property_id')->nullable();
            $table->integer('buyer_id')->unsigned()->nullable();
            $table->integer('seller_id')->unsigned()->nullable();
            $table->enum('buyer_type', ['company', 'customer'])->default('customer');
            $table->enum('seller_type', ['company', 'customer'])->default('company');
            $table->enum('transaction_type', ['rent', 'sale'])->default('sale');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'partial', 'completed', 'canceled'])->default('partial');
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
