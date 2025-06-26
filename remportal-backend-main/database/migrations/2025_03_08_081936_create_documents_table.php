<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade'); // Ensure documents belong to a company
            $table->bigInteger('uploaded_by');
            $table->string('name');
            $table->string('file_path');
            $table->enum('visibility', ['private', 'shared'])->default('private');
            $table->timestamps();
        });
        Schema::create('document_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_user_id')->constrained('company_users')->onDelete('cascade');
            $table->timestamps();
        });
        
    }

    public function down()
    {
        Schema::dropIfExists('document_user');
        Schema::dropIfExists('documents');
    }
};
