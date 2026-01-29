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
        Schema::table('agente_seguradora', function (Blueprint $table) {
            if (!Schema::hasColumn('agente_seguradora', 'data_inicio')) {
                $table->date('data_inicio')->nullable()->after('id_seguradora');
            }
            if (!Schema::hasColumn('agente_seguradora', 'data_fim')) {
                $table->date('data_fim')->nullable()->after('data_inicio'); // Note: 'after' might be tricky if data_inicio didn't just get created, but order is secondary.
            }
            
            if (!Schema::hasColumn('agente_seguradora', 'percentagem_comissao')) {
                $table->decimal('percentagem_comissao', 5, 2)->default(0)->after('data_fim');
            }
            if (!Schema::hasColumn('agente_seguradora', 'percentagem_comissao_angariacao')) {
                $table->decimal('percentagem_comissao_angariacao', 5, 2)->default(0)->after('percentagem_comissao');
            }
            if (!Schema::hasColumn('agente_seguradora', 'percentagem_comissao_cobranca')) {
                $table->decimal('percentagem_comissao_cobranca', 5, 2)->default(0)->after('percentagem_comissao_angariacao');
            }
            
            if (!Schema::hasColumn('agente_seguradora', 'estado')) {
                $table->enum('estado', ['ativo', 'inativo', 'suspenso'])->default('ativo')->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agente_seguradora', function (Blueprint $table) {
            $table->dropColumn([
                'data_inicio',
                'data_fim',
                'percentagem_comissao',
                'percentagem_comissao_angariacao',
                'percentagem_comissao_cobranca',
                'estado'
            ]);
        });
    }
};
