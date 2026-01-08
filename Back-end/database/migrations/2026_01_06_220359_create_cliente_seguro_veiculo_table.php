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
        Schema::create('cliente_seguro_veiculo', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_veiculo');
            $table->unsignedBigInteger('id_seguradora_seguro');
            $table->unsignedBigInteger('id_preco');
            $table->decimal('valor_bem', 15, 2);
            $table->decimal('premio_final', 12, 2);
            $table->enum('status', ['pendente', 'ativo', 'cancelado'])->default('pendente');
            $table->timestamps();

            $table->foreign('id_veiculo')->references('id_veiculo')->on('veiculos')->onDelete('cascade');
            $table->foreign('id_seguradora_seguro')->references('id')->on('seguradora_seguro')->onDelete('cascade');
            $table->foreign('id_preco')->references('id')->on('precos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cliente_seguro_veiculo');
    }
};
