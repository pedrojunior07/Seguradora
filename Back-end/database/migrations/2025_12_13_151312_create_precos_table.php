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
      Schema::create('precos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('seguradora_seguro_id')
          ->constrained('seguradora_seguro');
    $table->decimal('valor', 12, 2);
    $table->decimal('premio_percentagem', 5, 2);
    $table->decimal('premio_valor', 12, 2);
    $table->boolean('usa_valor')->default(false);
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
        Schema::dropIfExists('precos');
    }
};
