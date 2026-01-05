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
        Schema::create('seguradoras', function (Blueprint $table) {
            $table->id('id_seguradora');
            $table->string('nome');
            $table->string('nome_responsavel')->nullable();
            $table->string('nuit')->unique();
            $table->string('telefone1');
            $table->string('telefone2')->nullable();
            $table->string('email')->nullable();
            $table->string('endereco')->nullable();
            $table->string('licenca')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seguradoras');
    }
};
