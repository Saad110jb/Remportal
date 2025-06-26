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
        Schema::table('payments', function (Blueprint $table) {
            // Add lease_id foreign key
            $table->unsignedBigInteger('lease_id')->nullable()->after('flat_id');
            $table->foreign('lease_id')->references('id')->on('leases')->onDelete('set null');

            // Add user tracking columns
            $table->unsignedBigInteger('created_by')->nullable()->after('token');
            $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['lease_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);

            $table->dropColumn('lease_id');
            $table->dropColumn('created_by');
            $table->dropColumn('updated_by');
        });
    }
};
