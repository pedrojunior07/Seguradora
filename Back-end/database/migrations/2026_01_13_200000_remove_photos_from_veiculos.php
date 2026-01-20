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
            $table->dropColumn([
                'foto_pneus', 'foto_vidros', 'foto_cadeiras', 
                'foto_bagageira', 'foto_eletronicos', 'foto_acessorios',
                'foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
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
};
