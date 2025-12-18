<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('metodo_pagamentos', function (Blueprint $table) {
            $table->string('nome')->after('id');
            $table->string('codigo')->unique()->after('nome');
            $table->text('descricao')->nullable()->after('codigo');
            $table->boolean('ativo')->default(true)->after('descricao');
            $table->json('configuracoes')->nullable()->after('ativo');
        });
    }

    public function down(): void
    {
        Schema::table('metodo_pagamentos', function (Blueprint $table) {
            $table->dropUnique(['codigo']); // Remove o índice único antes de remover a coluna
            $table->dropColumn(['nome', 'codigo', 'descricao', 'ativo', 'configuracoes']);
        });
    }
};
