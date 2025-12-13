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
       Schema::create('comissao', function (Blueprint $table) {
    $table->id();

    $table->unsignedBigInteger('corretora_seguro_seguradora_id');
    $table->foreign('corretora_seguro_seguradora_id', 'comissao_corretora_fk')
          ->references('id')->on('corretora_seguroseguradora');

    $table->unsignedBigInteger('prop_cliente_seg_seguro_id');
    $table->foreign('prop_cliente_seg_seguro_id', 'comissao_prop_cliente_fk')
          ->references('id')->on('prop_cliente_seg_seguro');

    $table->decimal('base_calculo', 12, 2);
    $table->decimal('percentagem', 5, 2);
    $table->decimal('valor_comissao', 12, 2);

    $table->string('estado'); // pendente | paga | cancelada
    $table->date('data_calculo');
    $table->date('data_pagamento')->nullable();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comissaos');
    }
};
