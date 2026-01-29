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
        Schema::table('clientes', function (Blueprint $table) {
            if (!Schema::hasColumn('clientes', 'agente_id')) {
                $table->foreignId('agente_id')
                      ->nullable()
                      ->after('id_cliente')
                      ->constrained('agentes', 'id_agente');
            }
        });

        if (Schema::hasTable('veiculos')) {
            Schema::table('veiculos', function (Blueprint $table) {
                if (!Schema::hasColumn('veiculos', 'agente_id')) {
                    $table->foreignId('agente_id')
                          ->nullable()
                          ->after('id_veiculo')
                          ->constrained('agentes', 'id_agente');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['agente_id']);
            $table->dropColumn('agente_id');
        });

        if (Schema::hasTable('veiculos')) {
            Schema::table('veiculos', function (Blueprint $table) {
                 $table->dropForeign(['agente_id']);
                 $table->dropColumn('agente_id');
            });
        }
    }
};
