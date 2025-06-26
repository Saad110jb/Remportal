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
        Schema::create('subscriptions', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id'); // typically the company_admin
    $table->string('plan'); // e.g., 'basic', 'pro', 'enterprise'
    $table->date('start_date');
    $table->date('end_date')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
