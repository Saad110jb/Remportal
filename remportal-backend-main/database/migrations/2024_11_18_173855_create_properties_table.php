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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('company_id');
            $table->unsignedBigInteger('owner_id')->nullable(); 
            $table->string('name');
            $table->text('description');
            $table->text('location');
            $table->decimal('price', 10, 2);
            $table->integer('is_running')->default(0);
            $table->enum('status', ['available', 'sold', 'rented'])->default('available');
            $table->enum('property_for', ['rent', 'sale'])->default('sale');
            $table->enum('type', ['commercial', 'residential'])->default('commercial');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
