<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('detalhes_cobertura', function (Blueprint $table) {
            $table->decimal('valor_minimo', 15, 2)->nullable()->after('valor_maximo');
        });
    }

    public function down()
    {
        Schema::table('detalhes_cobertura', function (Blueprint $table) {
            $table->dropColumn('valor_minimo');
        });
    }
};
