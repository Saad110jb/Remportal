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
        Schema::table('customers', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
            $table->unsignedBigInteger('flat_id')->nullable()->after('user_id');

            $table->string('phone')->nullable()->after('password');
            $table->string('address')->nullable()->after('phone');

            $table->enum('status', ['active', 'inactive'])->default('active')->after('address');

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('flat_id')->references('id')->on('flats')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['user_id']);
            $table->dropForeign(['flat_id']);

            // Drop columns
            $table->dropColumn(['user_id', 'flat_id', 'phone', 'address', 'status']);
        });
    }
};
