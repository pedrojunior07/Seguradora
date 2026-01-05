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
}
