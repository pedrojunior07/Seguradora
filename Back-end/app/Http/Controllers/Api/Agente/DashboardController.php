<?php

namespace App\Http\Controllers\Api\Agente;

use App\Http\Controllers\Controller;
use App\Models\Proposta;
use App\Models\Apolice;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $agenteId = $user->perfil_id;

        $totalPropostas = Proposta::where('agente_id', $agenteId)->count();
        $propostasPendentes = Proposta::where('agente_id', $agenteId)->whereIn('status', ['rascunho', 'enviada'])->count();
        
        $totalApolices = Apolice::where('agente_id', $agenteId)->count();
        $apolicesAtivas = Apolice::where('agente_id', $agenteId)->where('status', 'ativa')->count();

        // A comissão será a soma das comissões pagas ou pendentes (se já implementado na tabela comissao)
        // Por agora, devolvemos estatísticas básicas de vendas
        return response()->json([
            'resumo' => [
                'total_propostas' => $totalPropostas,
                'propostas_pendentes' => $propostasPendentes,
                'total_apolices' => $totalApolices,
                'apolices_ativas' => $apolicesAtivas,
            ]
        ]);
    }
}
