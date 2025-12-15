<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('propostas', function (Blueprint $table) {
            $table->id('id_proposta');
            $table->string('numero_proposta')->unique();

            $table->foreignId('cliente_id')
                  ->constrained('clientes', 'id_cliente');

            $table->foreignId('seguradora_seguro_id')
                  ->constrained('seguradora_seguro');

            $table->enum('tipo_proposta', ['veiculo', 'propriedade']);

            // Bem a ser segurado
            $table->unsignedBigInteger('bem_id')->nullable();
            $table->string('bem_type')->nullable();

            // Quem criou a proposta
            $table->foreignId('corretora_id')
                  ->nullable()
                  ->constrained('corretoras', 'id_corretora');

            $table->foreignId('agente_id')
                  ->nullable()
                  ->constrained('agentes', 'id_agente');

            // Valores calculados
            $table->decimal('valor_bem', 15, 2);
            $table->decimal('premio_calculado', 12, 2);
            $table->integer('parcelas_sugeridas')->default(1);

            // Coberturas selecionadas
            $table->json('coberturas_selecionadas')->nullable();

            // Vigência proposta
            $table->date('data_inicio_proposta');
            $table->date('data_fim_proposta');
            $table->date('validade_proposta');

            // Status
            $table->enum('status', [
                'rascunho',
                'enviada',
                'em_analise',
                'aprovada',
                'rejeitada',
                'expirada',
                'convertida'
            ])->default('rascunho');

            $table->text('motivo_rejeicao')->nullable();
            $table->unsignedBigInteger('apolice_gerada_id')->nullable();

            $table->text('observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['cliente_id', 'status']);
            $table->index('validade_proposta');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('propostas');
    }
};
