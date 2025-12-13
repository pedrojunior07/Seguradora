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
  Schema::create('bem_penhora', function (Blueprint $table) {
    $table->id('id_penhora');

    $table->foreignId('id_prop_seguroseguradora')
          ->constrained('propriedade_seguroseguradora');

    $table->string('tipo_bem');
    $table->string('descricao')->nullable();
    $table->boolean('estado_bom')->default(true);
    $table->boolean('em_uso')->default(false);

    $table->foreignId('id_cat')
          ->constrained('cat_propriedade', 'id');

    $table->decimal('valor', 15, 2);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bem_penhoras');
    }
};
