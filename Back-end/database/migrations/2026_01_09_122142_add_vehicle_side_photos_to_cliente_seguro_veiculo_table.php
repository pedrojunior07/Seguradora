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
        Schema::table('cliente_seguro_veiculo', function (Blueprint $table) {
            $table->dropColumn(['foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito']);
        });
    }
};
