<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Manually rename the column for MariaDB compatibility
        DB::statement('ALTER TABLE leases CHANGE user_id customer_id BIGINT UNSIGNED NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the change
        DB::statement('ALTER TABLE leases CHANGE customer_id user_id BIGINT UNSIGNED NOT NULL');
    }
};
