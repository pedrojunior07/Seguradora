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
        Schema::table('seguradoras', function (Blueprint $table) {
            $table->string('licenca_br_path')->nullable()->after('licenca');
            $table->string('nuit_file_path')->nullable()->after('nuit');
            $table->string('bank_details_file_path')->nullable()->after('licenca_br_path');
            $table->boolean('verificado')->default(false)->after('status');
            $table->enum('status_verificacao', ['pendente', 'aprovado', 'rejeitado'])->default('pendente')->after('verificado');
            $table->text('motivo_rejeicao')->nullable()->after('status_verificacao');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seguradoras', function (Blueprint $table) {
            $table->dropColumn([
                'licenca_br_path',
                'nuit_file_path',
                'bank_details_file_path',
                'verificado',
                'status_verificacao',
                'motivo_rejeicao'
            ]);
        });
    }
};
