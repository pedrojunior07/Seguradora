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
      Schema::create('seguradora_seguro', function (Blueprint $table) {
    $table->id();
    $table->foreignId('id_seguradora')
          ->constrained('seguradoras', 'id_seguradora');
    $table->foreignId('id_seguro')
          ->constrained('seguros', 'id_seguro');

    $table->decimal('premio_minimo', 10, 2);
    $table->boolean('status')->default(true);
    $table->decimal('valor_minimo_dano', 10, 2)->nullable();
    $table->timestamps();
});
 
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seguradora_seguros');
    }
};
