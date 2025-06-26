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
        Schema::create('addon_user', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id'); // company admin
    $table->unsignedBigInteger('addon_id');
    $table->timestamps();

    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('addon_id')->references('id')->on('addons')->onDelete('cascade');
    $table->unique(['user_id', 'addon_id']); // no duplicate addon per user
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addon_user');
    }
};
