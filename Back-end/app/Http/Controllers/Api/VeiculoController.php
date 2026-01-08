<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VeiculoController extends Controller
{
    /**
     * Listar os veículos do cliente autenticado.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            // Assumindo que o User tem relação 'cliente' e Cliente tem 'veiculos'
            // O modelo Cliente foi visto anteriormente e tem hasMany Veiculo.
            
            if (!$user->cliente) {
                 return response()->json(['message' => 'Usuário não é um cliente ou não tem perfil associado.'], 403);
            }

            $veiculos = $user->cliente->veiculos; 

            // Se quiser carregar relacionamentos extras (ex: marca, modelo), usar ->load(...)
            // $veiculos->load('marca', 'modelo'); 
            
            return response()->json([
                'data' => $veiculos
            ], 200);
        } catch (\Exception $e) {
            \Log::error("Erro ao listar veículos do cliente: " . $e->getMessage());
            return response()->json(['message' => 'Erro ao buscar veículos.'], 500);
        }
    }
    /**
     * Cadastrar um novo veículo.
     */
    public function store(Request $request)
    {
        $request->validate([
            'marca' => 'required|string|max:50',
            'modelo' => 'required|string|max:50',
            'ano_fabrico' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'matricula' => 'required|string|unique:veiculos,matricula',
            'chassi' => 'required|string|unique:veiculos,chassi',
            'valor_estimado' => 'required|numeric|min:0',
            // Outros campos opcionais
        ]);

        try {
            $user = Auth::user();
            if (!$user->cliente) {
                return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
            }

            $veiculo = $user->cliente->veiculos()->create([
                'marca' => $request->marca,
                'modelo' => $request->modelo,
                'ano_fabrico' => $request->ano_fabrico,
                'matricula' => $request->matricula,
                'chassi' => $request->chassi, // Opcional
                'cor' => $request->cor,       // Opcional
                'valor_estimado' => $request->valor_estimado,
                'tipo_veiculo' => 'ligeiro', // Default ou vindo do request
            ]);

            return response()->json([
                'message' => 'Veículo cadastrado com sucesso!',
                'data' => $veiculo
            ], 201);
        } catch (\Exception $e) {
            \Log::error("Erro ao cadastrar veículo: " . $e->getMessage());
            return response()->json(['message' => 'Erro ao cadastrar veículo.'], 500);
        }
    }
}
