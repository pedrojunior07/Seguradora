<?php

namespace App\Http\Controllers\Api\Agente;

use App\Http\Controllers\Controller;
use App\Models\Agente;
use Illuminate\Http\Request;

class SeguroController extends Controller
{
    /**
     * Listar os seguros autorizados para o agente
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->perfil !== 'agente') {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agenteId = $user->perfil_id;
        
        // Obter o agente com os seguros autorizados (carregando os detalhes do seguro)
        $agente = Agente::with('segurosSeguradoras.seguro')->find($agenteId);

        if (!$agente) {
            return response()->json(['message' => 'Agente não encontrado.'], 404);
        }

        // Retornamos apenas a relação de seguros autorizados
        return response()->json([
            'data' => $agente->segurosSeguradoras
        ]);
    }
}
