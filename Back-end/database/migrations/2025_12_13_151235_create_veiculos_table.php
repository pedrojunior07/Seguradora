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
     Schema::create('veiculos', function (Blueprint $table) {
    $table->id('id_veiculo');
    $table->foreignId('id_cliente')
          ->constrained('clientes', 'id_cliente')
          ->cascadeOnDelete();

    $table->string('marca');
    $table->string('modelo');
    $table->year('ano_fabrico');
    $table->string('cor')->nullable();
    $table->string('matricula')->unique();
    $table->string('chassi')->unique();
    $table->decimal('valor_estimado', 15, 2);
    $table->string('tipo_veiculo');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('veiculos');
    }
};
