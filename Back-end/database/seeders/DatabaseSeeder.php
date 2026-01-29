<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create Admin User
        $adminEmail = 'admin@segurostm.com';
        if (!User::where('email', $adminEmail)->exists()) {
            User::factory()->create([
                'name' => 'Admin Sistema',
                'email' => $adminEmail,
                'password' => 'password', // Will be hashed by model cast or factory if needed, but 'hashed' cast does it automatically
                'perfil' => 'admin',
                'role' => 'super_admin_system',
                'status' => true,
            ]);
        }
    }
}
