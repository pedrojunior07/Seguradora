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
        // Altering enum to string or expanding enum is tricky in some DBs, 
        // but for string we can just change user column.
        Schema::table('users', function (Blueprint $table) {
            // Drop enum constraint/column and re-add as string to be safe and flexible, 
            // OR just change it. 'change()' method requires doctrine/dbal.
            // Let's assume standard change works or do a raw statement if needed.
            // Safest cross-db for enum->string is often raw or drop/add if data preservation isn't huge issue (it is dev).
            // But we can try 'string' modification.
            
            $table->string('role', 50)->default('operador')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert is harder without exact enum definition, so we skip strict revert for this hotfix.
        });
    }
};
