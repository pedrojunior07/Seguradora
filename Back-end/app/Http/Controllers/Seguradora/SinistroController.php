<?php

namespace App\Http\Controllers\Seguradora;

use App\Http\Controllers\Controller;
use App\Models\Sinistro;
use App\Services\SinistroService;
use Illuminate\Http\Request;

class SinistroController extends Controller
{
    public function __construct(protected SinistroService $sinistroService) {}
    
    public function index(Request $request)
    {
        $sinistros = \App\Models\Sinistro::whereHas('apolice.seguradoraSeguro', function ($q) use ($request) {
            $q->where('id_seguradora', $request->user()->perfil_id);
        })
        ->with([
            'apolice.cliente', 
            'apolice.bemSegurado', 
            'apolice.seguradoraSeguro.seguro.categoria', 
            'apolice.seguradoraSeguro.seguro.tipo',
            'latestAuditLog.user'
        ])
        ->orderBy('data_comunicacao', 'desc')
        ->paginate(20);

        return response()->json($sinistros);
    }

    public function pendentes(Request $request)
    {
        $sinistros = $this->sinistroService->listarSinistrosPorStatus('aberto', $request->user()->perfil_id);

        return response()->json($sinistros);
    }

    public function emAnalise(Request $request)
    {
        $sinistros = $this->sinistroService->listarSinistrosPorStatus('em_analise', $request->user()->perfil_id);

        return response()->json($sinistros);
    }

    public function show(Sinistro $sinistro, Request $request)
    {
        if ($sinistro->apolice->seguradoraSeguro->id_seguradora !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json($sinistro->load(['apolice.cliente', 'analista', 'itemSegurado']));
    }

    public function analisar(Sinistro $sinistro, Request $request)
    {
        if ($sinistro->apolice->seguradoraSeguro->id_seguradora !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        try {
            $sinistroAtualizado = $this->sinistroService->iniciarAnalise($sinistro, $request->user());

            return response()->json([
                'message' => 'Análise iniciada',
                'sinistro' => $sinistroAtualizado,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao iniciar análise',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function aprovar(Sinistro $sinistro, Request $request)
    {
        $request->validate([
            'valor_aprovado' => 'required|numeric|min:0',
            'franquia' => 'nullable|numeric|min:0',
        ]);

        if ($sinistro->apolice->seguradoraSeguro->id_seguradora !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        try {
            $sinistroAtualizado = $this->sinistroService->aprovarSinistro(
                $sinistro,
                $request->valor_aprovado,
                $request->franquia,
                $request->user()
            );

            return response()->json([
                'message' => 'Sinistro aprovado',
                'sinistro' => $sinistroAtualizado,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao aprovar sinistro',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function negar(Sinistro $sinistro, Request $request)
    {
        $request->validate([
            'motivo' => 'required|string|min:20',
        ]);

        if ($sinistro->apolice->seguradoraSeguro->id_seguradora !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $sinistroAtualizado = $this->sinistroService->negarSinistro($sinistro, $request->motivo, $request->user());

        return response()->json([
            'message' => 'Sinistro negado',
            'sinistro' => $sinistroAtualizado,
        ]);
    }

    public function estatisticas(Request $request)
    {
        $stats = $this->sinistroService->estatisticasSinistros($request->user()->perfil_id);

        return response()->json($stats);
    }
}
