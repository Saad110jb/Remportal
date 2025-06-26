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
        Schema::create('flats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('property_id');
            $table->unsignedBigInteger('owner_id')->nullable(); 
            $table->string('name');
            $table->integer('size');
            $table->decimal('price', 10, 2);
            $table->text('address');
            $table->integer('bedrooms');
            $table->integer('bathrooms');
            $table->integer('kitchen')->default(1);
            $table->integer('balcony')->default(0);
            $table->integer('is_running')->default(0);
            $table->enum('status', ['available', 'sold', 'reserved'])->default('available');
            $table->enum('type', ['commercial', 'residential'])->default('commercial');
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flats');
    }
};
