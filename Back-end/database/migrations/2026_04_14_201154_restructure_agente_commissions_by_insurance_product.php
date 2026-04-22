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
        // 1. Limpar campos gerais de comissão (pois será negociada por SEGURO)
        Schema::table('agente_corretora', function (Blueprint $table) {
            if (Schema::hasColumn('agente_corretora', 'comissao_angariacao')) {
                $table->dropColumn('comissao_angariacao');
            }
            if (Schema::hasColumn('agente_corretora', 'comissao_cobranca')) {
                $table->dropColumn('comissao_cobranca');
            }
        });

        Schema::table('agente_seguradora', function (Blueprint $table) {
            if (Schema::hasColumn('agente_seguradora', 'comissao_percentagem')) {
                $table->dropColumn('comissao_percentagem');
            }
        });

        // 2. Tabela de Seguro Específico para SEGURADORA (já existe, precisamos adicionar os dados de comissão)
        Schema::table('agente_seguroseguradora', function (Blueprint $table) {
            $table->decimal('percentagem_comissao_angariacao', 5, 2)->default(0)->after('status');
            $table->decimal('percentagem_comissao_cobranca', 5, 2)->default(0)->after('percentagem_comissao_angariacao');
            $table->date('data_inicio')->nullable()->after('percentagem_comissao_cobranca');
            $table->date('data_fim')->nullable()->after('data_inicio');
        });

        // 3. Tabela de Seguro Específico para CORRETORA (Criar a tabela de vínculo)
        Schema::create('agente_corretora_seguro', function (Blueprint $table) {
            $table->id('id_agente_corretora_seguro');
            
            $table->foreignId('id_agente')
                  ->constrained('agentes', 'id_agente')
                  ->cascadeOnDelete();
                  
            $table->unsignedBigInteger('id_corretora_seguroseguradora');
            $table->foreign('id_corretora_seguroseguradora', 'fk_agcorr_seg')
                  ->references('id')->on('corretora_seguroseguradora')
                  ->cascadeOnDelete();

            $table->decimal('percentagem_comissao_angariacao', 5, 2)->default(0);
            $table->decimal('percentagem_comissao_cobranca', 5, 2)->default(0);
            $table->boolean('estado')->default(true); // Ativo/Inativo
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->timestamps();
        });

        // 4. Adaptar tabela de Comissão (para referenciar o vínculo real que originou a venda)
        Schema::table('comissao', function (Blueprint $table) {
            $table->unsignedBigInteger('agente_seguroseguradora_id')->nullable()->after('prop_cliente_seg_seguro_id');
            $table->foreign('agente_seguroseguradora_id', 'fk_comissao_ag_seg')
                  ->references('id')->on('agente_seguroseguradora')
                  ->nullOnDelete();

            $table->unsignedBigInteger('agente_corretora_seguro_id')->nullable()->after('agente_seguroseguradora_id');
            $table->foreign('agente_corretora_seguro_id', 'fk_comissao_ag_corr')
                  ->references('id_agente_corretora_seguro')->on('agente_corretora_seguro')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comissao', function (Blueprint $table) {
            $table->dropForeign('fk_comissao_ag_seg');
            $table->dropColumn('agente_seguroseguradora_id');
            
            $table->dropForeign('fk_comissao_ag_corr');
            $table->dropColumn('agente_corretora_seguro_id');
        });

        Schema::dropIfExists('agente_corretora_seguro');

        Schema::table('agente_seguroseguradora', function (Blueprint $table) {
            $table->dropColumn([
                'percentagem_comissao_angariacao',
                'percentagem_comissao_cobranca',
                'data_inicio',
                'data_fim'
            ]);
        });

        Schema::table('agente_seguradora', function (Blueprint $table) {
            $table->decimal('comissao_percentagem', 5, 2)->default(0)->after('status');
        });

        Schema::table('agente_corretora', function (Blueprint $table) {
            $table->decimal('comissao_angariacao', 5, 2)->default(0)->after('data_fim');
            $table->decimal('comissao_cobranca', 5, 2)->default(0)->after('comissao_angariacao');
        });
    }
};
