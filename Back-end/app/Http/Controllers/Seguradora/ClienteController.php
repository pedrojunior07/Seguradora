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
        $user = auth()->user();
        
        // Se for seguradora, filtrar apenas clientes que têm apólices nesta seguradora
        if ($user->perfil === 'seguradora') {
            $seguradoraId = $user->perfil_id; // Assumindo que perfil_id é o ID da seguradora
            
            // Buscar clientes que tenham pelo menos uma apólice (ativa ou não) com esta seguradora
            // Precisamos garantir que a relação 'apolices' esteja definida no model Cliente
            // e que a tabela 'apolices' tenha 'seguradora_id'.
            // Consulta: Clientes que possuem apolices onde a seguradora_seguro associada pertence a esta seguradora
            $clientes = Cliente::whereHas('apolices', function ($query) use ($seguradoraId) {
                // Usando o scope do modelo Apolice ou relacionamento direto
                $query->whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
                    $q->where('id_seguradora', $seguradoraId);
                });
            })
            ->with('user')
            ->orderBy('nome')
            ->paginate(15);
            
            return response()->json($clientes);
        }

        // Fallback ou erro se não for seguradora (embora a rota seja prefixada)
        return response()->json(['data' => []]);
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
