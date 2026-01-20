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
        Schema::create('fotos_veiculos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_veiculo');
            $table->string('tipo'); // frente, traseira, lado_esquerdo, lado_direito
            $table->string('caminho');
            $table->timestamps();

            $table->foreign('id_veiculo')->references('id_veiculo')->on('veiculos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fotos_veiculos');
    }
};
