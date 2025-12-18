<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cliente\StorePagamentoRequest;
use App\Models\Pagamento;
use Illuminate\Http\Request;

class PagamentoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/cliente/pagamentos",
     *     summary="Listar todos os pagamentos do cliente",
     *     description="Retorna histórico completo de pagamentos do cliente autenticado",
     *     tags={"Cliente - Pagamentos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de pagamentos",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id_pagamento", type="integer", example=1),
     *                 @OA\Property(property="numero_pagamento", type="string", example="PAG-2024-001"),
     *                 @OA\Property(property="valor_parcela", type="number", example=150.00),
     *                 @OA\Property(property="data_vencimento", type="string", format="date", example="2024-02-15"),
     *                 @OA\Property(property="status", type="string", example="pendente"),
     *                 @OA\Property(property="apolice", type="object"),
     *                 @OA\Property(property="metodo_pagamento", type="object")
     *             ))
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $pagamentos = Pagamento::where('cliente_id', $request->user()->perfil_id)
            ->with(['apolice', 'metodoPagamento'])
            ->orderBy('data_vencimento')
            ->paginate(20);

        return response()->json($pagamentos);
    }

    public function pendentes(Request $request)
    {
        $pagamentos = Pagamento::where('cliente_id', $request->user()->perfil_id)
            ->where('status', 'pendente')
            ->with(['apolice', 'metodoPagamento'])
            ->orderBy('data_vencimento')
            ->get();

        return response()->json($pagamentos);
    }

    public function atrasados(Request $request)
    {
        $pagamentos = Pagamento::where('cliente_id', $request->user()->perfil_id)
            ->vencido()
            ->with(['apolice', 'metodoPagamento'])
            ->orderBy('data_vencimento')
            ->get();

        return response()->json($pagamentos);
    }

    public function show(Pagamento $pagamento, Request $request)
    {
        if ($pagamento->cliente_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json($pagamento->load(['apolice', 'metodoPagamento']));
    }

    /**
     * @OA\Post(
     *     path="/api/cliente/pagamentos/{pagamento}/registrar",
     *     summary="Registrar pagamento",
     *     description="Registra o pagamento de uma parcela com upload de comprovante",
     *     tags={"Cliente - Pagamentos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pagamento",
     *         in="path",
     *         description="ID do pagamento",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"metodo_pagamento_id"},
     *                 @OA\Property(property="metodo_pagamento_id", type="integer", example=1, description="ID do método de pagamento"),
     *                 @OA\Property(property="referencia_pagamento", type="string", example="REF-123456", description="Referência/código da transação"),
     *                 @OA\Property(property="comprovante", type="string", format="binary", description="Arquivo do comprovante de pagamento (imagem ou PDF)")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Pagamento registrado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pagamento registado com sucesso"),
     *             @OA\Property(property="pagamento", type="object",
     *                 @OA\Property(property="id_pagamento", type="integer", example=1),
     *                 @OA\Property(property="status", type="string", example="pago"),
     *                 @OA\Property(property="data_pagamento", type="string", format="datetime"),
     *                 @OA\Property(property="valor_pago", type="number", example=150.00)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Pagamento já processado ou erro ao registrar"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Não autorizado - pagamento não pertence ao cliente"
     *     )
     * )
     */
    public function registrarPagamento(Pagamento $pagamento, StorePagamentoRequest $request)
    {
        if ($pagamento->cliente_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        if ($pagamento->status !== 'pendente') {
            return response()->json([
                'message' => 'Este pagamento já foi processado',
            ], 400);
        }

        try {
            $caminhoComprovante = null;
            if ($request->hasFile('comprovante')) {
                $caminhoComprovante = $request->file('comprovante')
                    ->store('pagamentos/' . $pagamento->numero_pagamento, 'public');
            }

            $pagamento->registrarPagamento(
                $pagamento->valor_parcela,
                $request->metodo_pagamento_id,
                $request->referencia_pagamento,
                $caminhoComprovante
            );

            return response()->json([
                'message' => 'Pagamento registado com sucesso',
                'pagamento' => $pagamento->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao registar pagamento',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function estatisticas(Request $request)
    {
        $clienteId = $request->user()->perfil_id;

        $stats = [
            'total_pendente' => Pagamento::where('cliente_id', $clienteId)
                ->where('status', 'pendente')
                ->sum('valor_parcela'),
            'total_pago' => Pagamento::where('cliente_id', $clienteId)
                ->where('status', 'pago')
                ->sum('valor_pago'),
            'total_atrasado' => Pagamento::where('cliente_id', $clienteId)
                ->vencido()
                ->sum('valor_parcela'),
            'quantidade_pendente' => Pagamento::where('cliente_id', $clienteId)
                ->where('status', 'pendente')
                ->count(),
            'quantidade_pago' => Pagamento::where('cliente_id', $clienteId)
                ->where('status', 'pago')
                ->count(),
            'quantidade_atrasada' => Pagamento::where('cliente_id', $clienteId)
                ->vencido()
                ->count(),
        ];

        return response()->json($stats);
    }
}
