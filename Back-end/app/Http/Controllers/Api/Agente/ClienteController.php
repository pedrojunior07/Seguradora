<?php

namespace App\Http\Controllers\Api\Agente;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    /**
     * Listar os clientes criados pelo agente
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->perfil !== 'agente') {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agenteId = $user->perfil_id;
        
        $clientes = Cliente::where('agente_id', $agenteId)
            ->with(['user']) // assumindo que pode querer ver se o cliente tem utilizador ativo
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($clientes);
    }

    /**
     * Criar um novo cliente para o agente
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        if ($user->perfil !== 'agente') {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agenteId = $user->perfil_id;

        $validated = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'email' => 'required|email|unique:clientes,email',
            'telefone1' => 'required|string|max:20',
            'nuit' => 'required|string|max:20|unique:clientes,nuit',
            'tipo_cliente' => 'required|in:singular,juridica',
            // Adicione outros campos necessários
        ]);

        $dadosCliente = [
            'tipo_cliente' => $validated['tipo_cliente'],
            'nome' => $validated['nome_completo'],
            'email' => $validated['email'],
            'telefone1' => $validated['telefone1'],
            'nuit' => $validated['nuit'],
            'agente_id' => $agenteId,
        ];

        try {
            $cliente = Cliente::create($dadosCliente);
            return response()->json([
                'message' => 'Cliente criado com sucesso',
                'cliente' => $cliente
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao criar cliente: ' . $e->getMessage()], 500);
        }
    }
}
