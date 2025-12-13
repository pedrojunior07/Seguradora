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
        Schema::create('salarios', function (Blueprint $table) {
    $table->id('id_salario');

    $table->foreignId('id_colaborador')
          ->constrained('colaboradores', 'id_colaborador')
          ->cascadeOnDelete();

    $table->decimal('valor_base', 12, 2);
    $table->decimal('bonus', 12, 2)->default(0);
    $table->decimal('desconto', 12, 2)->default(0);
    $table->date('data_referencia');

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salarios');
    }
};
