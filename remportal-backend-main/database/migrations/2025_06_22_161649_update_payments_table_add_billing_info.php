<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'bill_id')) {
                $table->unsignedBigInteger('bill_id')->nullable()->after('id');
                $table->foreign('bill_id')->references('id')->on('bills')->onDelete('set null');
            }

            if (!Schema::hasColumn('payments', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable()->after('bill_id');
                $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null');
            }

            if (!Schema::hasColumn('payments', 'method')) {
                $table->string('method')->nullable()->after('amount');
            }

            if (!Schema::hasColumn('payments', 'reference')) {
                $table->string('reference')->nullable()->after('method');
            }

            if (Schema::hasColumn('payments', 'status')) {
                $table->enum('status', ['pending', 'paid'])->default('pending')->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'bill_id')) {
                $table->dropForeign(['bill_id']);
                $table->dropColumn('bill_id');
            }

            if (Schema::hasColumn('payments', 'customer_id')) {
                $table->dropForeign(['customer_id']);
                $table->dropColumn('customer_id');
            }

            if (Schema::hasColumn('payments', 'method')) {
                $table->dropColumn('method');
            }

            if (Schema::hasColumn('payments', 'reference')) {
                $table->dropColumn('reference');
            }
        });
    }
};
