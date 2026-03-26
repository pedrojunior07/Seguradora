<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Seguradora;
use App\Models\User;

class SeguradoraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Create Seguradora
        $seguradora = Seguradora::create([
            'nome' => 'Seguradora Premium',
            'nome_responsavel' => 'Carlos Silva',
            'nuit' => '123456789',
            'telefone1' => '+258841234567',
            'telefone2' => '+258821234567',
            'email' => 'contato@seguradorapremium.com',
            'endereco' => 'Av. Julius Nyerere, 123, Maputo',
            'licenca' => 'LIC-2024-001',
            'status' => true,
        ]);

        // 2. Create User for Seguradora
        $user = User::create([
            'name' => 'Admin Seguradora',
            'email' => 'admin@seguradorapremium.com',
            'password' => 'password', // Will be hashed automatically if cast is set or use Hash::make
            'perfil' => 'seguradora',
            'perfil_id' => $seguradora->id_seguradora, // Assuming consistency
            'seguradora_id' => $seguradora->id_seguradora, // Main link for Seguradora
            'status' => true,
            'role' => 'admin', // Or 'manager' depending on roles
        ]);

        $this->command->info('Seguradora e Usuário criados com sucesso!');
        $this->command->info('Email: ' . $user->email);
        $this->command->info('Password: password');
    }
}
