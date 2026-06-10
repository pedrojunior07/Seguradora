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
            if (!Schema::hasColumn('detalhes_bancarios', 'bankable_id')) {
                $table->unsignedBigInteger('bankable_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('detalhes_bancarios', 'bankable_type')) {
                $table->string('bankable_type')->nullable()->after('bankable_id');
            }
            if (!Schema::hasColumn('detalhes_bancarios', 'codigo_banco')) {
                $table->string('codigo_banco')->nullable()->after('nome_banco');
            }
            if (!Schema::hasColumn('detalhes_bancarios', 'agencia')) {
                $table->string('agencia')->nullable()->after('codigo_banco');
            }
            if (!Schema::hasColumn('detalhes_bancarios', 'tipo_conta')) {
                $table->string('tipo_conta')->default('corrente')->after('numero_conta');
            }
            if (!Schema::hasColumn('detalhes_bancarios', 'nuit_titular')) {
                $table->string('nuit_titular')->nullable()->after('titular');
            }
            if (!Schema::hasColumn('detalhes_bancarios', 'principal')) {
                $table->boolean('principal')->default(false)->after('nuit_titular');
            }
        });

        // Migrar dados existentes de seguradora_id para polymorphic
        if (Schema::hasColumn('detalhes_bancarios', 'seguradora_id')) {
            DB::table('detalhes_bancarios')->whereNotNull('seguradora_id')->update([
                'bankable_id' => DB::raw('seguradora_id'),
                'bankable_type' => 'App\Models\Seguradora',
            ]);

            Schema::table('detalhes_bancarios', function (Blueprint $table) {
                // Remover a coluna original após a migração
                $table->dropColumn('seguradora_id');
            });
        }
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
