<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ClienteEmpresaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $nuit = '987654321';
        $userEmail = 'admin@techsolutions.com';
        $empresaEmail = 'contact@techsolutions.com';

        // 1. Criar ou Atualizar Cliente (Empresa)
        $cliente = Cliente::firstOrCreate(
            ['nuit' => $nuit],
            [
                'tipo_cliente' => 'juridica',
                'tipo_empresa' => 'Sociedade Anônima',
                'nome' => 'Tech Solutions SA',
                'telefone1' => '+258849876543',
                'telefone2' => '+258829876543',
                'email' => $empresaEmail,
                'endereco' => 'Av. 24 de Julho, Maputo',
                'documento' => 'Certidão Comercial 12345',
            ]
        );

        // 2. Criar ou Atualizar Usuário associado
        $user = User::updateOrCreate(
            ['email' => $userEmail],
            [
                'name' => 'Admin Tech Solutions',
                'password' => 'password', // A model User faz o cast para hashed
                'perfil' => 'cliente',
                'perfil_id' => $cliente->id_cliente,
                'status' => true,
                'role' => 'admin',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $this->command->info('Cliente Empresa e Usuário processados com sucesso!');
        $this->command->info('Email: ' . $user->email);
        $this->command->info('Password: password');
    }
}
