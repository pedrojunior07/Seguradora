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
        Schema::create('frota_veiculo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('frota_id')->constrained('frotas')->onDelete('cascade');
            $table->foreignId('veiculo_id')->constrained('veiculos', 'id_veiculo')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frota_veiculo');
    }
};
