<?php

namespace App\Http\Controllers\Seguradora;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ClienteController extends Controller
{
    /**
     * Listar clientes associados à seguradora (via apólices ou criação direta se houver vínculo)
     * Por enquanto, vamos listar todos os clientes do sistema ou criar uma tabela de vínculo seguradora_cliente?
     * Pelo requisito simples, vamos listar todos os clientes por enquanto, ou filtrar se houver relação.
     * Mas o operador pode "Criar Clientes". Então ele cria um user 'cliente'.
     */
    public function index(Request $request)
    {
        // Idealmente, filtraríamos apenas clientes desta seguradora.
        // Como o modelo de dados pode não ter vínculo direto "Cliente pertence a Seguradora X" (cliente é livre),
        // podemos listar todos ou apenas aqueles com apólices nesta seguradora.
        // Para "Criar Clientes" e depois "Associar", o operador precisa ver o que criou.
        
        // Vamos listar todos os clientes para permitir selecionar qualquer um.
        $clientes = Cliente::with('user')->paginate(15);
        
        return response()->json($clientes);
    }

    /**
     * Criar novo cliente
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nuit' => 'required|string|unique:clientes,nuit',
            'telefone1' => 'required|string|max:20',
            'telefone2' => 'nullable|string|max:20',
            'endereco' => 'nullable|string|max:255',
            'tipo_cliente' => 'required|in:fisica,juridica',
            'documento' => 'nullable|string|max:50',
            'password' => 'required|string|min:6',
        ]);

        return DB::transaction(function () use ($validated) {
            $cliente = Cliente::create([
                'tipo_cliente' => $validated['tipo_cliente'],
                'nome' => $validated['nome_completo'],
                'nuit' => $validated['nuit'],
                'telefone1' => $validated['telefone1'],
                'telefone2' => $validated['telefone2'] ?? null,
                'documento' => $validated['documento'] ?? null,
                'email' => $validated['email'],
                'endereco' => $validated['endereco'] ?? null,
            ]);

            $user = User::create([
                'name' => $validated['nome_completo'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'perfil' => 'cliente',
                'perfil_id' => $cliente->getKey(),
                'telefone' => $validated['telefone1'],
                'status' => true,
                'role' => 'super_admin', // Cliente é dono de sua conta? vamos deixar padrão ou null. Cliente não usa role 'operador'.
            ]);

            return response()->json([
                'message' => 'Cliente criado com sucesso',
                'cliente' => $cliente,
                'user' => $user
            ], 201);
        });
    }
}
