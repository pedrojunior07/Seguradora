<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sinistros', function (Blueprint $table) {
            $table->id('id_sinistro');
            $table->string('numero_sinistro')->unique();

            $table->foreignId('apolice_id')
                  ->constrained('apolices', 'id_apolice');

            $table->foreignId('cliente_id')
                  ->constrained('clientes', 'id_cliente');

            // Detalhes do sinistro
            $table->datetime('data_ocorrencia');
            $table->datetime('data_comunicacao');
            $table->string('local_ocorrencia');
            $table->text('descricao_ocorrencia');

            // Tipo e causa
            $table->string('tipo_sinistro'); // colisão, roubo, incêndio, etc
            $table->string('causa_provavel')->nullable();

            // Valores
            $table->decimal('valor_estimado_dano', 15, 2)->nullable();
            $table->decimal('valor_aprovado', 15, 2)->nullable();
            $table->decimal('valor_franquia', 12, 2)->default(0);
            $table->decimal('valor_indenizacao', 15, 2)->nullable();

            // Status do processo
            $table->enum('status', [
                'aberto',
                'em_analise',
                'aguardando_documentos',
                'em_vistoria',
                'aprovado',
                'parcialmente_aprovado',
                'negado',
                'pago',
                'cancelado'
            ])->default('aberto');

            // Documentação
            $table->json('documentos')->nullable();
            $table->text('parecer_tecnico')->nullable();

            // Terceiros envolvidos
            $table->boolean('envolve_terceiros')->default(false);
            $table->json('dados_terceiros')->nullable();

            // Boletim de ocorrência
            $table->string('numero_bo')->nullable();
            $table->date('data_bo')->nullable();

            // Análise
            $table->unsignedBigInteger('analista_id')->nullable();
            $table->timestamp('data_analise')->nullable();
            $table->text('motivo_negacao')->nullable();

            // Pagamento
            $table->date('data_pagamento')->nullable();
            $table->string('forma_pagamento')->nullable();

            $table->text('observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['apolice_id', 'status']);
            $table->index('data_ocorrencia');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinistros');
    }
};
