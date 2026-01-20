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
        Schema::table('veiculos', function (Blueprint $table) {
            $table->integer('quilometragem_registrada')->nullable();
            $table->string('tipo_uso')->nullable();
            
            // Estados
            $table->text('estado_pneus')->nullable();
            $table->text('estado_vidros')->nullable();
            $table->text('estado_cadeiras')->nullable();
            $table->text('estado_bagageira')->nullable();
            $table->text('estado_eletronicos')->nullable();
            $table->text('estado_acessorios')->nullable();

            // Fotos
            $table->string('foto_pneus')->nullable();
            $table->string('foto_vidros')->nullable();
            $table->string('foto_cadeiras')->nullable();
            $table->string('foto_bagageira')->nullable();
            $table->string('foto_eletronicos')->nullable();
            $table->string('foto_acessorios')->nullable();
            $table->string('foto_frente')->nullable();
            $table->string('foto_traseira')->nullable();
            $table->string('foto_lado_esquerdo')->nullable();
            $table->string('foto_lado_direito')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
            $table->dropColumn([
                'quilometragem_registrada', 'tipo_uso',
                'estado_pneus', 'estado_vidros', 'estado_cadeiras', 'estado_bagageira', 'estado_eletronicos', 'estado_acessorios',
                'foto_pneus', 'foto_vidros', 'foto_cadeiras', 'foto_bagageira', 'foto_eletronicos', 'foto_acessorios',
                'foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito'
            ]);
        });
    }
};
