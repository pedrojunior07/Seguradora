<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('perfil', ['seguradora', 'corretora', 'cliente', 'agente', 'admin'])->after('email');
            $table->unsignedBigInteger('perfil_id')->nullable()->after('perfil');
            $table->boolean('status')->default(true)->after('perfil_id');
            $table->string('telefone')->nullable()->after('status');
            $table->timestamp('ultimo_acesso')->nullable()->after('telefone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['perfil', 'perfil_id', 'status', 'telefone', 'ultimo_acesso']);
        });
    }
};
