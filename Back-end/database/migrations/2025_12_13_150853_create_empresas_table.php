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
    Schema::create('empresas', function (Blueprint $table) {
    $table->id('id_empresa');
    $table->string('nome');
    $table->string('nuit')->unique();
    $table->string('telefone')->nullable();
    $table->string('email')->nullable();
    $table->string('endereco')->nullable();
    $table->boolean('status')->default(true);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
