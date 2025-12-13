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
 Schema::create('veiculo_seguradora_seguro', function (Blueprint $table) {
    $table->id();
    $table->foreignId('veiculo_id')->constrained('veiculos');
    $table->foreignId('seguradora_seguro_id')
          ->constrained('seguradora_seguro');
    $table->string('estado');
    $table->date('data_associacao');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('veiculo_seguradora_seguros');
    }
};
