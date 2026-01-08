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
            DB::statement("ALTER TABLE precos MODIFY COLUMN valor DECIMAL(12, 2) NULL");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('precos', function (Blueprint $table) {
            DB::statement("UPDATE precos SET valor = 0 WHERE valor IS NULL");
            DB::statement("ALTER TABLE precos MODIFY COLUMN valor DECIMAL(12, 2) NOT NULL");
        });
    }
};
