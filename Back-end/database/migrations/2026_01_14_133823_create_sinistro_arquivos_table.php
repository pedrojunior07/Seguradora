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
        Schema::create('sinistro_arquivos', function (Blueprint $table) {
            $table->id('id_arquivo');
            $table->foreignId('sinistro_id')
                  ->constrained('sinistros', 'id_sinistro')
                  ->onDelete('cascade');
            
            $table->string('caminho');
            $table->string('tipo'); // imagem, documento
            $table->string('nome_original');
            $table->integer('tamanho');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sinistro_arquivos');
    }
};
