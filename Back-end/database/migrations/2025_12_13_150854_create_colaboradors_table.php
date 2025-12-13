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
       Schema::create('colaboradores', function (Blueprint $table) {
    $table->id('id_colaborador');

    $table->foreignId('id_empresa')
          ->constrained('empresas', 'id_empresa')
          ->cascadeOnDelete();

    $table->string('nome');
    $table->string('cargo');
    $table->string('telefone')->nullable();
    $table->string('email')->nullable();
    $table->string('documento')->nullable();
    $table->date('data_admissao');
    $table->boolean('status')->default(true);

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('colaboradors');
    }
};
