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
        Schema::table('cliente_seguro_veiculo', function (Blueprint $table) {
            $table->integer('quilometragem_atual')->nullable();
            $table->string('tipo_uso')->nullable(); // pessoal, comercial, aplicativo
            
            // Estados de conservação (poderia ser nota de 1-5 ou texto)
            $table->string('estado_pneus')->nullable();
            $table->string('estado_vidros')->nullable();
            $table->string('estado_cadeiras')->nullable();
            $table->string('estado_bagageira')->nullable();
            $table->string('estado_eletronicos')->nullable();
            $table->string('estado_acessorios')->nullable();

            // Caminhos das Fotos
            $table->string('foto_pneus')->nullable();
            $table->string('foto_vidros')->nullable();
            $table->string('foto_cadeiras')->nullable();
            $table->string('foto_bagageira')->nullable();
            $table->string('foto_eletronicos')->nullable();
            $table->string('foto_acessorios')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cliente_seguro_veiculo', function (Blueprint $table) {
            $table->dropColumn([
                'quilometragem_atual', 'tipo_uso',
                'estado_pneus', 'estado_vidros', 'estado_cadeiras', 'estado_bagageira', 'estado_eletronicos', 'estado_acessorios',
                'foto_pneus', 'foto_vidros', 'foto_cadeiras', 'foto_bagageira', 'foto_eletronicos', 'foto_acessorios'
            ]);
        });
    }
};
