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
        $table->bigIncrements('id_seguro');

        $table->unsignedBigInteger('id_categoria');
        $table->foreign('id_categoria')
              ->references('id_categoria')
              ->on('categorias');

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
        Schema::dropIfExists('seguros');
    }
};
