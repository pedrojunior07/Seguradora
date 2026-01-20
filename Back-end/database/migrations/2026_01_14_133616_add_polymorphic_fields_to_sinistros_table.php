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
        Schema::table('sinistros', function (Blueprint $table) {
            $table->unsignedBigInteger('item_segurado_id')->after('cliente_id')->nullable();
            $table->string('item_segurado_type')->after('item_segurado_id')->nullable();
            
            $table->index(['item_segurado_id', 'item_segurado_type'], 'sinistro_item_segurado_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sinistros', function (Blueprint $table) {
            $table->dropIndex('sinistro_item_segurado_index');
            $table->dropColumn(['item_segurado_id', 'item_segurado_type']);
        });
    }
};
