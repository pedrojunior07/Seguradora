<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cliente\StoreSinistroRequest;
use App\Models\Sinistro;
use App\Services\SinistroService;
use Illuminate\Http\Request;

class SinistroController extends Controller
{
    public function __construct(protected SinistroService $sinistroService) {}

    /**
     * @OA\Get(
     *     path="/api/cliente/sinistros",
     *     summary="Listar sinistros do cliente",
     *     description="Retorna todos os sinistros registrados pelo cliente autenticado",
     *     tags={"Cliente - Sinistros"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de sinistros",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id_sinistro", type="integer", example=1),
     *                 @OA\Property(property="numero_sinistro", type="string", example="SIN-2024-001"),
     *                 @OA\Property(property="status", type="string", example="em_analise"),
     *                 @OA\Property(property="data_comunicacao", type="string", format="date"),
     *                 @OA\Property(property="descricao_ocorrido", type="string"),
     *                 @OA\Property(property="valor_estimado_dano", type="number"),
     *                 @OA\Property(property="apolice", type="object")
     *             ))
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $sinistros = Sinistro::where('cliente_id', $request->user()->perfil_id)
            ->with(['apolice.bemSegurado', 'apolice.seguradoraSeguro.seguradora', 'apolice.seguradoraSeguro.seguro.categoria', 'apolice.seguradoraSeguro.seguro.tipo'])
            ->paginate(20);

        return response()->json($sinistros);
    }

    /**
     * @OA\Post(
     *     path="/api/cliente/sinistros",
     *     summary="Registrar novo sinistro",
     *     description="Registra uma ocorrência de sinistro para uma apólice ativa",
     *     tags={"Cliente - Sinistros"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"apolice_id","data_ocorrencia","descricao_ocorrido","valor_estimado_dano"},
     *             @OA\Property(property="apolice_id", type="integer", example=1, description="ID da apólice"),
     *             @OA\Property(property="data_ocorrencia", type="string", format="date", example="2024-01-15", description="Data em que ocorreu o sinistro"),
     *             @OA\Property(property="hora_ocorrencia", type="string", format="time", example="14:30:00"),
     *             @OA\Property(property="local_ocorrencia", type="string", example="Av. Julius Nyerere, Maputo"),
     *             @OA\Property(property="descricao_ocorrido", type="string", example="Colisão traseira em semáforo"),
     *             @OA\Property(property="valor_estimado_dano", type="number", example=5000.00),
     *             @OA\Property(property="houve_vitimas", type="boolean", example=false),
     *             @OA\Property(property="boletim_ocorrencia", type="string", example="BO-2024-12345")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Sinistro registrado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Sinistro registado com sucesso"),
     *             @OA\Property(property="sinistro", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erro ao registrar sinistro"
     *     )
     * )
     */
    public function store(StoreSinistroRequest $request)
    {
        try {
            $dados = $request->validated();
            $dados['cliente_id'] = $request->user()->perfil_id;

            $sinistro = $this->sinistroService->registrarSinistro($dados);

            return response()->json([
                'message' => 'Sinistro registado com sucesso',
                'sinistro' => $sinistro->load(['apolice', 'apolice.seguradoraSeguro.seguro.categoria', 'apolice.seguradoraSeguro.seguro.tipo']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao registar sinistro',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(Sinistro $sinistro, Request $request)
    {
        if ($sinistro->cliente_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json($sinistro->load([
            'apolice.seguradoraSeguro.seguradora',
            'apolice.seguradoraSeguro.seguro.categoria',
            'apolice.seguradoraSeguro.seguro.tipo',
            'apolice.bemSegurado',
            'analista',
        ]));
    }

    public function acompanhamento(Sinistro $sinistro, Request $request)
    {
        if ($sinistro->cliente_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json([
            'numero_sinistro' => $sinistro->numero_sinistro,
            'status' => $sinistro->status,
            'data_comunicacao' => $sinistro->data_comunicacao,
            'data_analise' => $sinistro->data_analise,
            'valor_estimado' => $sinistro->valor_estimado_dano,
            'valor_aprovado' => $sinistro->valor_aprovado,
            'valor_indenizacao' => $sinistro->valor_indenizacao,
            'data_pagamento' => $sinistro->data_pagamento,
            'observacoes' => $sinistro->observacoes,
        ]);
    }

    public function estatisticas(Request $request)
    {
        $clienteId = $request->user()->perfil_id;

        $stats = [
            'total_sinistros' => Sinistro::where('cliente_id', $clienteId)->count(),
            'abertos' => Sinistro::where('cliente_id', $clienteId)->where('status', 'aberto')->count(),
            'em_analise' => Sinistro::where('cliente_id', $clienteId)->where('status', 'em_analise')->count(),
            'aprovados' => Sinistro::where('cliente_id', $clienteId)->where('status', 'aprovado')->count(),
            'pagos' => Sinistro::where('cliente_id', $clienteId)->where('status', 'pago')->count(),
            'negados' => Sinistro::where('cliente_id', $clienteId)->where('status', 'negado')->count(),
            'valor_total_indenizado' => Sinistro::where('cliente_id', $clienteId)
                ->where('status', 'pago')
                ->sum('valor_indenizacao'),
        ];

        return response()->json($stats);
    }
}
