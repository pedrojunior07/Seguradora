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
        Schema::table('seguros', function (Blueprint $table) {
            // Check if columns exist, if not add them.
            if (!Schema::hasColumn('seguros', 'data_criacao')) {
                $table->timestamp('data_criacao')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'));
            } else {
                 // make it nullable and default current timestamp if it exists but is strict
                 $table->timestamp('data_criacao')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'))->change();
            }

            if (!Schema::hasColumn('seguros', 'data_atualizacao')) {
                $table->timestamp('data_atualizacao')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();
            } else {
                 $table->timestamp('data_atualizacao')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seguros', function (Blueprint $table) {
             // We generally don't drop in this fix migration as data might be there, 
             // but strictly speaking we should reverse.
             // leaving empty to depend on main migration logic.
        });
    }
};
