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
     Schema::create('agente_corretora', function (Blueprint $table) {
    $table->id();

    $table->foreignId('id_agente')
          ->constrained('agentes', 'id_agente')
          ->cascadeOnDelete();

    $table->foreignId('id_corretora')
          ->constrained('corretoras', 'id_corretora')
          ->cascadeOnDelete();

    $table->date('data_inicio');
    $table->date('data_fim')->nullable();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agente_corretoras');
    }
};
