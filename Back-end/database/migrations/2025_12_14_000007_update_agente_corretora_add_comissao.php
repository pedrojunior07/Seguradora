<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agente_corretora', function (Blueprint $table) {
            $table->decimal('comissao_angariacao', 5, 2)->default(0)->after('data_fim');
            $table->decimal('comissao_cobranca', 5, 2)->default(0)->after('comissao_angariacao');
            $table->boolean('status')->default(true)->after('comissao_cobranca');
        });

        Schema::table('agente_seguradora', function (Blueprint $table) {
            $table->decimal('comissao_percentagem', 5, 2)->default(0)->after('status');
            $table->date('data_inicio')->nullable()->after('comissao_percentagem');
            $table->date('data_fim')->nullable()->after('data_inicio');
        });
    }

    public function down(): void
    {
        Schema::table('agente_corretora', function (Blueprint $table) {
            $table->dropColumn(['comissao_angariacao', 'comissao_cobranca', 'status']);
        });

        Schema::table('agente_seguradora', function (Blueprint $table) {
            $table->dropColumn(['comissao_percentagem', 'data_inicio', 'data_fim']);
        });
    }
};
