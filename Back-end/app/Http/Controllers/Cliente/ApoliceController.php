<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Apolice;
use Illuminate\Http\Request;

class ApoliceController extends Controller
{
    public function index(Request $request)
    {
        $apolices = Apolice::where('cliente_id', $request->user()->perfil_id)
            ->with(['seguradoraSeguro.seguro', 'bemSegurado', 'pagamentos'])
            ->paginate(20);

        return response()->json($apolices);
    }

    public function ativas(Request $request)
    {
        $apolices = Apolice::where('cliente_id', $request->user()->perfil_id)
            ->where('status', 'ativa')
            ->with(['seguradoraSeguro.seguro', 'bemSegurado', 'pagamentos'])
            ->get();

        return response()->json($apolices);
    }

    public function show(Apolice $apolice, Request $request)
    {
        if ($apolice->cliente_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json($apolice->load([
            'seguradoraSeguro.seguro',
            'seguradoraSeguro.seguradora',
            'seguradoraSeguro.coberturas',
            'bemSegurado',
            'pagamentos',
            'sinistros',
            'corretora',
            'agente',
        ]));
    }

    public function pagamentos(Apolice $apolice, Request $request)
    {
        if ($apolice->cliente_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $pagamentos = $apolice->pagamentos()->paginate(10);

        return response()->json($pagamentos);
    }

    public function estatisticas(Request $request)
    {
        $clienteId = $request->user()->perfil_id;

        $stats = [
            'total_apolices' => Apolice::where('cliente_id', $clienteId)->count(),
            'ativas' => Apolice::where('cliente_id', $clienteId)->where('status', 'ativa')->count(),
            'expiradas' => Apolice::where('cliente_id', $clienteId)->where('status', 'expirada')->count(),
            'suspensas' => Apolice::where('cliente_id', $clienteId)->where('status', 'suspensa')->count(),
            'valor_total_premios' => Apolice::where('cliente_id', $clienteId)
                ->where('status', 'ativa')
                ->sum('premio_total'),
            'valor_total_pago' => Apolice::where('cliente_id', $clienteId)
                ->whereHas('pagamentos', function ($q) {
                    $q->where('status', 'pago');
                })
                ->sum(\Illuminate\Database\Query\Expression::raw('(SELECT SUM(valor_pago) FROM pagamentos WHERE apolice_id = apolices.id_apolice)')),
        ];

        return response()->json($stats);
    }
}
