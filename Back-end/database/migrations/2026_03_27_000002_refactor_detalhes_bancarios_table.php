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
        Schema::table('detalhes_bancarios', function (Blueprint $table) {
            $table->unsignedBigInteger('bankable_id')->nullable()->after('id');
            $table->string('bankable_type')->nullable()->after('bankable_id');
            $table->string('codigo_banco')->nullable()->after('nome_banco');
            $table->string('agencia')->nullable()->after('codigo_banco');
            $table->string('tipo_conta')->default('corrente')->after('numero_conta');
            $table->string('nuit_titular')->nullable()->after('titular');
            $table->boolean('principal')->default(false)->after('nuit_titular');
        });

        // Migrar dados existentes de seguradora_id para polymorphic
        DB::table('detalhes_bancarios')->whereNotNull('seguradora_id')->update([
            'bankable_id' => DB::raw('seguradora_id'),
            'bankable_type' => 'App\Models\Seguradora',
        ]);

        Schema::table('detalhes_bancarios', function (Blueprint $table) {
            // Remover a foreign key e a coluna original após a migração
            $table->dropForeign(['seguradora_id']);
            $table->dropColumn('seguradora_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detalhes_bancarios', function (Blueprint $table) {
            $table->unsignedBigInteger('seguradora_id')->nullable()->after('titular');
            $table->foreign('seguradora_id')->references('id_seguradora')->on('seguradoras');
        });

        // Restaurar dados
        DB::table('detalhes_bancarios')->where('bankable_type', 'App\Models\Seguradora')->update([
            'seguradora_id' => DB::raw('bankable_id'),
        ]);

        Schema::table('detalhes_bancarios', function (Blueprint $table) {
            $table->dropColumn([
                'bankable_id',
                'bankable_type',
                'codigo_banco',
                'agencia',
                'tipo_conta',
                'nuit_titular',
                'principal'
            ]);
        });
    }
};
