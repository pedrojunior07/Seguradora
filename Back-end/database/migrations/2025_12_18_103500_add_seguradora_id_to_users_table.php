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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('seguradora_id')->nullable()->after('perfil_id');
            
            $table->foreign('seguradora_id')
                  ->references('id_seguradora')
                  ->on('seguradoras')
                  ->onDelete('cascade');
        });

        // Optional: Populate seguradora_id for existing users where perfil is 'seguradora'
        DB::statement("UPDATE users SET seguradora_id = perfil_id WHERE perfil = 'seguradora'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['seguradora_id']);
            $table->dropColumn('seguradora_id');
        });
    }
};
