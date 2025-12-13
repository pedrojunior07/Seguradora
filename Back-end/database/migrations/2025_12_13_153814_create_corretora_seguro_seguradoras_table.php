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
        Schema::create('corretora_seguroseguradora', function (Blueprint $table) {
    $table->id();

    $table->foreignId('id_corretora')
          ->constrained('corretoras', 'id_corretora')
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
        Schema::dropIfExists('corretora_seguro_seguradoras');
    }
};
