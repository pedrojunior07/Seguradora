<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pagamento;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MpesaController extends Controller
{
    protected $mpesaService;

    public function __construct(MpesaService $mpesaService)
    {
        $this->mpesaService = $mpesaService;
    }

    /**
     * Inicia o processo de pagamento via M-Pesa enviando o pedido USSD fictício.
     */
    public function pagar(Request $request, $id)
    {
        $request->validate([
            'numero_telefone' => ['required', 'string', 'regex:/^(84|85)\d{7}$/'],
        ]);

        $pagamento = Pagamento::findOrFail($id);

        if ($pagamento->status === 'pago') {
            return response()->json(['message' => 'Este pagamento já foi concluído.'], 400);
        }

        $resultado = $this->mpesaService->iniciarPagamentoC2B(
            $request->numero_telefone,
            $pagamento->valor_parcela,
            $pagamento->numero_pagamento
        );

        return response()->json([
            'message' => 'Pedido USSD enviado. Por favor, introduza o PIN no seu telemóvel.',
            'transaction_id' => $resultado['transaction_id'],
            'status' => 'PENDING'
        ]);
    }

    /**
     * Simula a verificação de que o utilizador digitou o PIN no USSD.
     */
    public function consultarStatus(Request $request, $id)
    {
        $pagamento = Pagamento::findOrFail($id);

        if ($pagamento->status === 'pago') {
            return response()->json(['message' => 'Pagamento já confirmado.', 'pagamento' => $pagamento], 200);
        }

        // Simula que o serviço M-Pesa verifica se o PIN foi digitado
        $statusMpesa = $this->mpesaService->consultarTransacao($request->transaction_id ?? 'test');

        if ($statusMpesa['status'] === 'COMPLETE') {
            $ficticioController = new PagamentoFicticioController();
            return $ficticioController->confirmarPagamento($id);
        }

        return response()->json(['message' => 'Aguardando confirmação do PIN...', 'status' => 'PENDING'], 202);
    }
}
