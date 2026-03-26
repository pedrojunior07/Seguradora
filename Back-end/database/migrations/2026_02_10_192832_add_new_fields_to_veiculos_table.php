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
        Schema::table('veiculos', function (Blueprint $table) {
            $table->string('cilindrada')->nullable()->after('tipo_veiculo');
            $table->string('combustivel')->nullable()->after('cilindrada');
            $table->integer('numero_lugares')->nullable()->after('combustivel');
            $table->string('estado_veiculo')->nullable()->after('numero_lugares');
            $table->text('observacoes')->nullable()->after('estado_veiculo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
            $table->dropColumn(['cilindrada', 'combustivel', 'numero_lugares', 'estado_veiculo', 'observacoes']);
        });
    }
};
