<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            if (!Schema::hasColumn('addons', 'company_id')) {
                $table->unsignedBigInteger('company_id')->nullable()->after('id');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            if (Schema::hasColumn('addons', 'company_id')) {
                $table->dropForeign(['company_id']);
                $table->dropColumn('company_id');
            }
        });
    }
};
