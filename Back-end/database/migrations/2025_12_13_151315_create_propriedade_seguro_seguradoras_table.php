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
      Schema::create('propriedade_seguroseguradora', function (Blueprint $table) {
    $table->id();

    $table->foreignId('propriedade_id')
          ->constrained('empresa_propriedade', 'id_propriet');

    $table->foreignId('seguro_seguradora')
          ->constrained('seguradora_seguro');

    $table->string('status');
    $table->date('data_registo');
    $table->date('data_inicio');
    $table->date('data_fim')->nullable();

    $table->decimal('premio', 10, 2);
    $table->text('observacoes')->nullable();
    $table->integer('quant_prestacoes')->nullable();
    $table->decimal('premio_prestacao', 10, 2)->nullable();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('propriedade_seguro_seguradoras');
    }
};
