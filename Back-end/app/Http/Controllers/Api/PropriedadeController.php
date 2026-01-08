<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropriedadeCliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PropriedadeController extends Controller
{
    /**
     * Listar propriedades do cliente autenticado
     */
    public function index()
    {
        $user = Auth::user();
        
        // Assumindo que o usuário tem um 'cliente_id' ou algo similar
        // Se for um usuário do tipo cliente, ele deve ter id_cliente.
        // Vamos buscar pelo id do usuário se o relacionamento estiver configurado, 
        // ou filtrando pelo id_cliente do usuário.
        
        $propriedades = PropriedadeCliente::where('cliente_id', $user->id_cliente)->get();
        
        return response()->json(['data' => $propriedades]);
    }
}
