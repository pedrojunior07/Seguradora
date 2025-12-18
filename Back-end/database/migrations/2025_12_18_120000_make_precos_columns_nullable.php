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
        Schema::table('precos', function (Blueprint $table) {
            // Using raw SQL to ensure compatibility without doctrine/dbal if not installed
            // Assuming MySQL
            DB::statement("ALTER TABLE precos MODIFY COLUMN premio_percentagem DECIMAL(10, 2) NULL");
            DB::statement("ALTER TABLE precos MODIFY COLUMN premio_valor DECIMAL(10, 2) NULL");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('precos', function (Blueprint $table) {
             // Revert to NOT NULL (assuming they were not null before)
             // Defaulting to 0 to avoid error on rollback if data contains nulls
             DB::statement("UPDATE precos SET premio_percentagem = 0 WHERE premio_percentagem IS NULL");
             DB::statement("UPDATE precos SET premio_valor = 0 WHERE premio_valor IS NULL");
             
             DB::statement("ALTER TABLE precos MODIFY COLUMN premio_percentagem DECIMAL(10, 2) NOT NULL");
             DB::statement("ALTER TABLE precos MODIFY COLUMN premio_valor DECIMAL(10, 2) NOT NULL");
        });
    }
};
