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
      Schema::create('empresa_propriedade', function (Blueprint $table) {
    $table->id('id_propriet');

    $table->foreignId('id_categoria')
          ->constrained('cat_propriedade', 'id');

    $table->integer('numero_compartimentos')->nullable();
    $table->decimal('valor_estimado', 15, 2);
    $table->string('upload_fotos')->nullable();
    $table->string('upload_documentos')->nullable();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresa_propriedades');
    }
};
