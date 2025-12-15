<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id('id_pagamento');
            $table->string('numero_pagamento')->unique();

            $table->foreignId('apolice_id')
                  ->constrained('apolices', 'id_apolice');

            $table->foreignId('cliente_id')
                  ->constrained('clientes', 'id_cliente');

            // Parcela
            $table->integer('numero_parcela');
            $table->integer('total_parcelas');

            // Valores
            $table->decimal('valor_parcela', 12, 2);
            $table->decimal('valor_pago', 12, 2)->nullable();
            $table->decimal('juros', 10, 2)->default(0);
            $table->decimal('multa', 10, 2)->default(0);
            $table->decimal('desconto', 10, 2)->default(0);

            // Datas
            $table->date('data_vencimento');
            $table->date('data_pagamento')->nullable();

            // Método de pagamento
            $table->foreignId('metodo_pagamento_id')
                  ->nullable()
                  ->constrained('metodo_pagamentos');

            $table->string('referencia_pagamento')->nullable();
            $table->string('comprovante')->nullable();

            // Status
            $table->enum('status', [
                'pendente',
                'pago',
                'atrasado',
                'cancelado',
                'estornado'
            ])->default('pendente');

            $table->text('observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['apolice_id', 'status']);
            $table->index('data_vencimento');
            $table->unique(['apolice_id', 'numero_parcela']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamentos');
    }
};
