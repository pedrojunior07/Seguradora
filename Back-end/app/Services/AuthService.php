<?php

namespace App\Services;

use App\Models\Agente;
use App\Models\Cliente;
use App\Models\Corretora;
use App\Models\Seguradora;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function registrar(array $dados): array
    {
        return DB::transaction(function () use ($dados) {
            $entidade = null;

            switch ($dados['perfil']) {
                case 'seguradora':
                    $entidade = Seguradora::create([
                        'nome' => $dados['nome_empresa'],
                        'nuit' => $dados['nuit'],
                        'telefone' => $dados['telefone'] ?? '',
                        'email' => $dados['email'],
                        'endereco' => $dados['endereco'] ?? null,
                        'status' => true,
                    ]);
                    break;

                case 'corretora':
                    $entidade = Corretora::create([
                        'nome' => $dados['nome_empresa'],
                        'nuit' => $dados['nuit'],
                        'telefone' => $dados['telefone'] ?? '',
                        'email' => $dados['email'],
                        'endereco' => $dados['endereco'] ?? null,
                        'licenca' => $dados['licenca'] ?? null,
                        'status' => true,
                    ]);
                    break;

                case 'cliente':
                    $entidade = Cliente::create([
                        'tipo_cliente' => $dados['tipo_cliente'],
                        'nome' => $dados['nome_completo'],
                        'nuit' => $dados['nuit'],
                        'telefone1' => $dados['telefone1'],
                        'telefone2' => $dados['telefone2'] ?? null,
                        'documento' => $dados['documento'] ?? null,
                        'email' => $dados['email'],
                        'endereco' => $dados['endereco'] ?? null,
                    ]);
                    break;
            }

            $user = User::create([
                'name' => $dados['name'],
                'email' => $dados['email'],
                'password' => Hash::make($dados['password']),
                'perfil' => $dados['perfil'],
                'perfil_id' => $entidade->getKey(),
                'telefone' => $dados['telefone'] ?? null,
                'status' => true,
            ]);

            return [
                'user' => $user,
                'entidade' => $entidade,
            ];
        });
    }

    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        if (!$user->status) {
            throw new \Exception('Usuário inativo');
        }

        $user->ultimo_acesso = now();
        $user->save();

        $token = auth('api')->login($user);

        return [
            'user' => $user->load($user->perfil),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ];
    }

    public function criarAgente(array $dados, string $vinculoTipo, int $vinculoId): array
    {
        return DB::transaction(function () use ($dados, $vinculoTipo, $vinculoId) {
            $agente = Agente::create([
                'nome' => $dados['nome'],
                'telefone' => $dados['telefone'],
                'email' => $dados['email'],
                'documento' => $dados['documento'] ?? null,
                'status' => true,
            ]);

            // Criar vínculo
            if ($vinculoTipo === 'seguradora') {
                DB::table('agente_seguradora')->insert([
                    'id_agente' => $agente->id_agente,
                    'id_seguradora' => $vinculoId,
                    'status' => true,
                    'comissao_percentagem' => $dados['comissao_percentagem'] ?? 0,
                    'data_inicio' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('agente_corretora')->insert([
                    'id_agente' => $agente->id_agente,
                    'id_corretora' => $vinculoId,
                    'data_inicio' => now(),
                    'comissao_angariacao' => $dados['comissao_angariacao'] ?? 0,
                    'comissao_cobranca' => $dados['comissao_cobranca'] ?? 0,
                    'status' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Criar usuário para o agente
            $user = User::create([
                'name' => $dados['nome'],
                'email' => $dados['email'],
                'password' => Hash::make($dados['password'] ?? 'agente123'),
                'perfil' => 'agente',
                'perfil_id' => $agente->id_agente,
                'telefone' => $dados['telefone'],
                'status' => true,
            ]);

            return [
                'agente' => $agente,
                'user' => $user,
            ];
        });
    }
}
