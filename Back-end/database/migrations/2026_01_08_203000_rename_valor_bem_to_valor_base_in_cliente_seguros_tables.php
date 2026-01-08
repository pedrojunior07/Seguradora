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
            $table->renameColumn('valor_bem', 'valor_base');
        });

        Schema::table('cliente_seguro_propriedade', function (Blueprint $table) {
            $table->renameColumn('valor_bem', 'valor_base');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cliente_seguro_veiculo', function (Blueprint $table) {
            $table->renameColumn('valor_base', 'valor_bem');
        });

        Schema::table('cliente_seguro_propriedade', function (Blueprint $table) {
            $table->renameColumn('valor_base', 'valor_bem');
        });
    }
};
