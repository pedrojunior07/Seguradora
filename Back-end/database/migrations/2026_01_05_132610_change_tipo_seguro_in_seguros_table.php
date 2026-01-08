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
        // First drop the old column (we assume data loss is acceptable as per plan or dev env)
        Schema::table('seguros', function (Blueprint $table) {
            $table->dropColumn('tipo_seguro');
        });

        // Add the new column
        Schema::table('seguros', function (Blueprint $table) {
            $table->unsignedBigInteger('id_tipo_seguro')->after('id_categoria');
            
            $table->foreign('id_tipo_seguro')
                  ->references('id')
                  ->on('tipos_seguro')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seguros', function (Blueprint $table) {
            $table->dropForeign(['id_tipo_seguro']);
            $table->dropColumn('id_tipo_seguro');
            $table->string('tipo_seguro');
        });
    }
};
