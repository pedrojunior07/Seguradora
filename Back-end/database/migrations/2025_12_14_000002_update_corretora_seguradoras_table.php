<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('corretora_seguradoras');

        Schema::create('corretora_seguradora', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_corretora')
                  ->constrained('corretoras', 'id_corretora')
                  ->cascadeOnDelete();

            $table->foreignId('id_seguradora')
                  ->constrained('seguradoras', 'id_seguradora')
                  ->cascadeOnDelete();

            $table->enum('status', ['pendente', 'aprovada', 'rejeitada', 'suspensa'])->default('pendente');
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->decimal('comissao_percentagem', 5, 2)->default(0);
            $table->text('observacoes')->nullable();
            $table->timestamp('data_aprovacao')->nullable();
            $table->unsignedBigInteger('aprovado_por')->nullable();

            $table->timestamps();

            $table->unique(['id_corretora', 'id_seguradora']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('corretora_seguradora');
    }
};
