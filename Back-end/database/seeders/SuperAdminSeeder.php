<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = 'admin@segurostm.com';
        
        // Verifica se já existe
        $user = User::where('email', $adminEmail)->first();

        if ($user) {
            $user->update([
                'name' => 'Super Admin',
                'role' => 'super_admin_system',
                'perfil' => 'admin',
                'status' => true,
                'password' => 'password', // Hash cast will handle this
            ]);
            $this->command->info('Usuário Super Admin atualizado com sucesso!');
        } else {
            User::create([
                'name' => 'Super Admin',
                'email' => $adminEmail,
                'password' => 'password', // Hash cast will handle this
                'perfil' => 'admin',
                'role' => 'super_admin_system',
                'status' => true,
            ]);
            $this->command->info('Usuário Super Admin criado com sucesso!');
        }
        
        $this->command->info("Email: $adminEmail");
        $this->command->info("Senha: password");
    }
}
