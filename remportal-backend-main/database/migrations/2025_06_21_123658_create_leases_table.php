// database/migrations/xxxx_xx_xx_create_leases_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeasesTable extends Migration
{
    public function up()
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // tenant
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('flat_id')->nullable()->constrained()->onDelete('set null');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('monthly_rent', 10, 2);
            $table->string('status')->default('active'); // active, terminated, completed
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('leases');
    }
}
