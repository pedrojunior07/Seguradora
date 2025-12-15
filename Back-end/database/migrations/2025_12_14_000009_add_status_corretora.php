<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('corretoras', function (Blueprint $table) {
            $table->boolean('status')->default(true)->after('endereco');
            $table->string('licenca')->nullable()->after('status');
            $table->date('data_licenca_validade')->nullable()->after('licenca');
        });
    }

    public function down(): void
    {
        Schema::table('corretoras', function (Blueprint $table) {
            $table->dropColumn(['status', 'licenca', 'data_licenca_validade']);
        });
    }
};
