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
        Schema::create('seguros', function (Blueprint $table) {
    $table->id('id_seguro');
    $table->foreignId('id_categoria')
          ->constrained('categorias', 'id_categoria');

    $table->string('nome');
    $table->text('descricao')->nullable();
    $table->string('tipo_seguro');
    $table->date('data_criacao');
    $table->date('data_atualizacao')->nullable();
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
