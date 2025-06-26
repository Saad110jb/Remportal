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
        Schema::table('notices', function (Blueprint $table) {
            // Make sure the column exists and is unsigned
            if (!Schema::hasColumn('notices', 'admin_id')) {
                $table->unsignedBigInteger('admin_id')->nullable();
            } else {
                $table->unsignedBigInteger('admin_id')->change();
            }

            // Add foreign key constraint to users.id
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            // Optional: drop the column
            // $table->dropColumn('admin_id');
        });
    }
};
