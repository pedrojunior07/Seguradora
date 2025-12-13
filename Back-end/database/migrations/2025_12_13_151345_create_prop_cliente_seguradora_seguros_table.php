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
       Schema::create('prop_cliente_seg_seguro', function (Blueprint $table) {
    $table->id();

    $table->unsignedBigInteger('propriedade_cliente_id');
    $table->foreign('propriedade_cliente_id', 'prop_cliente_fk')
          ->references('id')->on('propriedade_cliente');

    $table->unsignedBigInteger('seguradora_seguro_id');
    $table->foreign('seguradora_seguro_id', 'seg_seguro_fk')
          ->references('id')->on('seguradora_seguro');

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
