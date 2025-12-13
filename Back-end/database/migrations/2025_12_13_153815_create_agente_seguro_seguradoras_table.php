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
     Schema::create('agente_seguroseguradora', function (Blueprint $table) {
    $table->id();

    $table->foreignId('id_agente')
          ->constrained('agentes', 'id_agente')
          ->cascadeOnDelete();

    $table->foreignId('id_seguro_seguradora')
          ->constrained('seguradora_seguro')
          ->cascadeOnDelete();

    $table->boolean('status')->default(true);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agente_seguro_seguradoras');
    }
};
