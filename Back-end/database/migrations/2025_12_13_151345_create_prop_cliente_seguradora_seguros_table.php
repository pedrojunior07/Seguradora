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
       Schema::create('propriedade_cliente_seguradora_seguro', function (Blueprint $table) {
    $table->id();

    $table->foreignId('propriedade_cliente_id')
          ->constrained('propriedade_cliente');

    $table->foreignId('seguradora_seguro_id')
          ->constrained('seguradora_seguro');

    $table->string('status');
    $table->date('data_registo');
    $table->date('data_inicio');
    $table->date('data_fim')->nullable();

    $table->decimal('premio', 12, 2);
    $table->text('observacoes')->nullable();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prop_cliente_seguradora_seguros');
    }
};
