<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cliente\StorePagamentoRequest;
use App\Models\Pagamento;
use Illuminate\Http\Request;

class PagamentoController extends Controller
{
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
