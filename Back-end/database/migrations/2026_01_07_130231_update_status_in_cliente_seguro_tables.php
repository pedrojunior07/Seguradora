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
        Schema::table('cliente_seguro_veiculo', function (Blueprint $table) {
            $table->string('status')->default('proposta')->change();
        });

        Schema::table('cliente_seguro_propriedade', function (Blueprint $table) {
            $table->string('status')->default('proposta')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cliente_seguro_veiculo', function (Blueprint $table) {
            $table->enum('status', ['pendente', 'ativo', 'cancelado'])->default('pendente')->change();
        });

        Schema::table('cliente_seguro_propriedade', function (Blueprint $table) {
            $table->enum('status', ['pendente', 'ativo', 'cancelado'])->default('pendente')->change();
        });
    }
};
