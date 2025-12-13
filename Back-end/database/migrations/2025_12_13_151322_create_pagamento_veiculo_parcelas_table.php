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
      Schema::create('pagamento_veiculo_parcela', function (Blueprint $table) {
    $table->id('id_parcela');
    $table->integer('numero_parcela');
    $table->decimal('valor_parcela', 10, 2);
    $table->boolean('pago')->default(false);
    $table->date('data_inicio_pagamento');
    $table->date('data_fim_pagamento')->nullable();

    $table->unsignedBigInteger('id_veiculo_seguro');
    $table->unsignedBigInteger('id_metodo_pagamento')->nullable();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagamento_veiculo_parcelas');
    }
};
