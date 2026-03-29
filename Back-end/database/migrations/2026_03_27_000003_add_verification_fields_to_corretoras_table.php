<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('corretoras', function (Blueprint $table) {
            $table->string('licenca_br_path')->nullable();
            $table->string('nuit_file_path')->nullable();
            $table->string('bank_details_file_path')->nullable();
            $table->boolean('verificado')->default(false);
            $table->enum('status_verificacao', ['nao_enviado', 'pendente', 'aprovado', 'rejeitado'])->default('nao_enviado');
            $table->text('motivo_rejeicao')->nullable();
        });
    }

    public function down(): void {
        Schema::table('corretoras', function (Blueprint $table) {
            $table->dropColumn(['licenca_br_path', 'nuit_file_path', 'bank_details_file_path', 'verificado', 'status_verificacao', 'motivo_rejeicao']);
        });
    }
};
