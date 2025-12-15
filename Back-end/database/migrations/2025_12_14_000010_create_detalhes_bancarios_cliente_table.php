<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalhes_bancarios_cliente', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cliente_id')
                  ->constrained('clientes', 'id_cliente')
                  ->cascadeOnDelete();

            $table->string('nome_banco');
            $table->string('codigo_banco')->nullable();
            $table->string('agencia')->nullable();
            $table->string('numero_conta');
            $table->string('tipo_conta')->default('corrente'); // corrente, poupança
            $table->string('titular');
            $table->string('cpf_cnpj_titular')->nullable();
            $table->boolean('principal')->default(false);
            $table->boolean('ativo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalhes_bancarios_cliente');
    }
};
