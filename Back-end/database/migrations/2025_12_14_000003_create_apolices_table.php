<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apolices', function (Blueprint $table) {
            $table->id('id_apolice');
            $table->string('numero_apolice')->unique();

            $table->foreignId('cliente_id')
                  ->constrained('clientes', 'id_cliente');

            $table->foreignId('seguradora_seguro_id')
                  ->constrained('seguradora_seguro');

            $table->enum('tipo_apolice', ['veiculo', 'propriedade']);

            // Referência ao bem segurado (veiculo_id ou propriedade_id)
            $table->unsignedBigInteger('bem_segurado_id');
            $table->string('bem_segurado_type'); // App\Models\Veiculo ou App\Models\PropriedadeCliente

            // Agente/Corretora que vendeu
            $table->foreignId('agente_id')
                  ->nullable()
                  ->constrained('agentes', 'id_agente');

            $table->foreignId('corretora_id')
                  ->nullable()
                  ->constrained('corretoras', 'id_corretora');

            // Datas
            $table->date('data_emissao');
            $table->date('data_inicio_vigencia');
            $table->date('data_fim_vigencia');

            // Valores
            $table->decimal('valor_segurado', 15, 2);
            $table->decimal('premio_total', 12, 2);
            $table->decimal('premio_liquido', 12, 2)->nullable();
            $table->integer('numero_parcelas')->default(1);
            $table->decimal('franquia', 12, 2)->default(0);

            // Status
            $table->enum('status', [
                'rascunho',
                'pendente_aprovacao',
                'aprovada',
                'ativa',
                'suspensa',
                'cancelada',
                'expirada',
                'sinistrada'
            ])->default('rascunho');

            $table->text('motivo_cancelamento')->nullable();
            $table->timestamp('data_cancelamento')->nullable();
            $table->unsignedBigInteger('cancelado_por')->nullable();

            // Aprovação
            $table->timestamp('data_aprovacao')->nullable();
            $table->unsignedBigInteger('aprovado_por')->nullable();

            $table->text('observacoes')->nullable();
            $table->json('coberturas_selecionadas')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['cliente_id', 'status']);
            $table->index(['seguradora_seguro_id', 'status']);
            $table->index('data_fim_vigencia');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apolices');
    }
};
