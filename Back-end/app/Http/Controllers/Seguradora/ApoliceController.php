<?php

namespace App\Http\Controllers\Seguradora;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seguradora\AprovarApoliceRequest;
use App\Models\Apolice;
use App\Services\ApoliceService;
use Illuminate\Http\Request;

class ApoliceController extends Controller
{
    public function __construct(protected ApoliceService $apoliceService) {}

    public function pendentes(Request $request)
    {
        $apolices = Apolice::where('status', 'pendente_aprovacao')
            ->whereHas('seguradoraSeguro', function ($q) use ($request) {
                $q->where('id_seguradora', $request->user()->perfil_id);
            })
            ->with(['cliente', 'bemSegurado', 'seguradoraSeguro.seguro'])
            ->paginate(20);

        return response()->json($apolices);
    }

    public function ativas(Request $request)
    {
        $apolices = Apolice::where('status', 'ativa')
            ->whereHas('seguradoraSeguro', function ($q) use ($request) {
                $q->where('id_seguradora', $request->user()->perfil_id);
            })
            ->with(['cliente', 'bemSegurado', 'seguradoraSeguro.seguro'])
            ->paginate(20);

        return response()->json($apolices);
    }

    public function show(Apolice $apolice, Request $request)
    {
        // Verificar acesso
        if ($apolice->seguradoraSeguro->id_seguradora !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json($apolice->load([
            'cliente',
            'bemSegurado',
            'seguradoraSeguro.seguro',
            'seguradoraSeguro.coberturas',
            'pagamentos',
            'sinistros',
        ]));
    }

    public function aprovar(Apolice $apolice, AprovarApoliceRequest $request)
    {
        // Verificar acesso
        if ($apolice->seguradoraSeguro->id_seguradora !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        try {
            $apoliceAtualizada = $this->apoliceService->aprovarApolice($apolice, $request->user());

            return response()->json([
                'message' => 'Apólice aprovada com sucesso',
                'apolice' => $apoliceAtualizada,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao aprovar apólice',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function rejeitar(Apolice $apolice, Request $request)
    {
        $request->validate([
            'motivo' => 'required|string|min:10',
        ]);

        // Verificar acesso
        if ($apolice->seguradoraSeguro->id_seguradora !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $apolice->status = 'cancelada';
        $apolice->motivo_cancelamento = $request->motivo;
        $apolice->cancelado_por = $request->user()->id;
        $apolice->save();

        return response()->json([
            'message' => 'Apólice rejeitada',
            'apolice' => $apolice,
        ]);
    }

    public function estadisticas(Request $request)
    {
        $seguradoraId = $request->user()->perfil_id;

        $stats = [
            'total_apolices' => Apolice::whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            })->count(),
            'ativas' => Apolice::whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            })->where('status', 'ativa')->count(),
            'pendentes' => Apolice::whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            })->where('status', 'pendente_aprovacao')->count(),
            'valor_total_premios' => Apolice::whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            })->where('status', 'ativa')->sum('premio_total'),
        ];

        return response()->json($stats);
    }
}
