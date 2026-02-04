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
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('tipo_empresa')->nullable()->after('tipo_cliente');
            $table->string('upload_nuit')->nullable()->after('nuit');
            $table->string('upload_doc_representante')->nullable()->after('documento'); // Documento do representante
            $table->string('upload_certidao_comercial')->nullable()->after('upload_doc_representante');
            $table->string('upload_licenca')->nullable()->after('upload_certidao_comercial');
            $table->string('upload_br')->nullable()->after('upload_licenca'); // Boletim da República (opcional)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn([
                'tipo_empresa',
                'upload_nuit',
                'upload_doc_representante',
                'upload_certidao_comercial',
                'upload_licenca',
                'upload_br'
            ]);
        });
    }
};
