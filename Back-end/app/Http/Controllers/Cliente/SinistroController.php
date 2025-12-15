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

    public function index(Request $request)
    {
        $sinistros = Sinistro::where('cliente_id', $request->user()->perfil_id)
            ->with(['apolice.bemSegurado', 'apolice.seguradoraSeguro.seguradora'])
            ->paginate(20);

        return response()->json($sinistros);
    }

    public function store(StoreSinistroRequest $request)
    {
        try {
            $dados = $request->validated();
            $dados['cliente_id'] = $request->user()->perfil_id;

            $sinistro = $this->sinistroService->registrarSinistro($dados);

            return response()->json([
                'message' => 'Sinistro registado com sucesso',
                'sinistro' => $sinistro->load(['apolice', 'apolice.seguradoraSeguro']),
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
