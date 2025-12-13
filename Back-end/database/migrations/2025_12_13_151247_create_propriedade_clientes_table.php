<?php 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('propriedade_cliente', function (Blueprint $table) {
            $table->id();

            // Dono da propriedade
            $table->foreignId('cliente_id')
                  ->constrained('clientes')
                  ->cascadeOnDelete();

            // Dados da propriedade
            $table->string('tipo_propriedade'); // casa, armazém, terreno, loja, etc
            $table->string('descricao');
            $table->string('endereco')->nullable();

            // Avaliação
            $table->decimal('valor_estimado', 15, 2);
            $table->date('data_avaliacao')->nullable();

            // Estado
            $table->string('estado')->default('ativo'); // ativo | inativo

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('propriedade_cliente');
    }
};
