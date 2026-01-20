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

    /**
     * @OA\Get(
     *     path="/api/seguradora/apolices/pendentes",
     *     summary="Listar apólices pendentes de aprovação",
     *     description="Retorna todas as apólices que aguardam aprovação da seguradora",
     *     tags={"Seguradora - Apólices"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de apólices pendentes",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id_apolice", type="integer", example=1),
     *                 @OA\Property(property="numero_apolice", type="string", example="APO-2024-001"),
     *                 @OA\Property(property="status", type="string", example="pendente_aprovacao"),
     *                 @OA\Property(property="premio_total", type="number", example=1500.00),
     *                 @OA\Property(property="data_inicio", type="string", format="date", example="2024-01-15"),
     *                 @OA\Property(property="data_fim", type="string", format="date", example="2025-01-15"),
     *                 @OA\Property(property="cliente", type="object"),
     *                 @OA\Property(property="bem_segurado", type="object")
     *             ))
     *         )
     *     )
     * )
     */
    public function pendentes(Request $request)
    {
        $apolices = Apolice::where('status', 'pendente_aprovacao')
            ->whereHas('seguradoraSeguro', function ($q) use ($request) {
                $q->where('id_seguradora', $request->user()->perfil_id);
            })
            ->with(['cliente', 'bemSegurado', 'seguradoraSeguro.seguro.categoria', 'seguradoraSeguro.seguro.tipo', 'aprovador', 'latestAuditLog.user'])
            ->paginate(20);

        return response()->json($apolices);
    }

    public function ativas(Request $request)
    {
        $apolices = Apolice::where('status', 'ativa')
            ->whereHas('seguradoraSeguro', function ($q) use ($request) {
                $q->where('id_seguradora', $request->user()->perfil_id);
            })
            ->with(['cliente', 'bemSegurado', 'seguradoraSeguro.seguro.categoria', 'seguradoraSeguro.seguro.tipo', 'aprovador', 'latestAuditLog.user'])
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
            'seguradoraSeguro.seguro.categoria',
            'seguradoraSeguro.seguro.tipo',
            'seguradoraSeguro.coberturas',
            'pagamentos',
            'sinistros',
            'aprovador',
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/seguradora/apolices/{apolice}/aprovar",
     *     summary="Aprovar apólice",
     *     description="Aprova uma apólice pendente, ativando-a no sistema",
     *     tags={"Seguradora - Apólices"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="apolice",
     *         in="path",
     *         description="ID da apólice",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="observacoes", type="string", example="Apólice aprovada conforme análise de risco")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Apólice aprovada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Apólice aprovada com sucesso"),
     *             @OA\Property(property="apolice", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erro ao aprovar apólice"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Não autorizado - apólice não pertence à seguradora"
     *     )
     * )
     */
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

    public function contratacoesDiretas(Request $request)
    {
        $seguradoraId = $request->user()->perfil_id;

        $veiculos = \App\Models\ClienteSeguroVeiculo::whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            })
            ->with(['veiculo.cliente', 'seguradoraSeguro.seguro', 'preco'])
            ->get()
            ->map(function($item) {
                $item->tipo_bem = 'veiculo';
                $item->identificacao_bem = $item->veiculo->matricula . " (" . $item->veiculo->marca . " " . $item->veiculo->modelo . ")";
                $item->cliente_nome = $item->veiculo->cliente->nome;
                return $item;
            });

        $propriedades = \App\Models\ClienteSeguroPropriedade::whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            })
            ->with(['propriedade.cliente', 'seguradoraSeguro.seguro', 'preco'])
            ->get()
            ->map(function($item) {
                $item->tipo_bem = 'propriedade';
                $item->identificacao_bem = $item->propriedade->descricao . " (" . $item->propriedade->tipo_propriedade . ")";
                $item->cliente_nome = $item->propriedade->cliente->nome;
                return $item;
            });

        $consolidado = $veiculos->concat($propriedades)->sortByDesc('created_at')->values();

        return response()->json(['data' => $consolidado]);
    }

    public function decidirProposta(Request $request, $id)
    {
        $request->validate([
            'decisao' => 'required|in:aprovar,rejeitar',
            'tipo_bem' => 'required|in:veiculo,propriedade',
        ]);

        $seguradoraId = $request->user()->perfil_id;
        $registro = null;

        if ($request->tipo_bem === 'veiculo') {
            $registro = \App\Models\ClienteSeguroVeiculo::findOrFail($id);
        } else {
            $registro = \App\Models\ClienteSeguroPropriedade::findOrFail($id);
        }

        // Verificar acesso
        if ($registro->seguradoraSeguro->id_seguradora !== $seguradoraId) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        if ($request->decisao === 'aprovar') {
            $registro->status = 'ativo';
        } else {
            $registro->status = 'rejeitado';
        }

        $registro->save();

        return response()->json([
            'message' => 'Proposta ' . ($request->decisao === 'aprovar' ? 'aprovada' : 'rejeitada') . ' com sucesso!',
            'data' => $registro
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
