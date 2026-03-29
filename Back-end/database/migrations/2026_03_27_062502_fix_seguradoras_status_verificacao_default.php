<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, add 'nao_enviado' to the enum for Seguradoras
        Schema::table('seguradoras', function (Blueprint $table) {
            $table->enum('status_verificacao', ['nao_enviado', 'pendente', 'aprovado', 'rejeitado'])
                  ->default('nao_enviado')
                  ->change();
        });

        // Set everyone back to 'nao_enviado' if they haven't uploaded secondary documents yet
        DB::table('seguradoras')
            ->whereNull('licenca_br_path')
            ->whereNull('nuit_file_path')
            ->update(['status_verificacao' => 'nao_enviado']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seguradoras', function (Blueprint $table) {
            $table->enum('status_verificacao', ['pendente', 'aprovado', 'rejeitado'])
                  ->default('pendente')
                  ->change();
        });
    }
};
