<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ContratacaoSeguroVeiculoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContratacaoController extends Controller
{
    protected $contratacaoService;

    public function __construct(ContratacaoSeguroVeiculoService $contratacaoService)
    {
        $this->contratacaoService = $contratacaoService;
    }

    /**
     * @OA\Post(
     *     path="/api/contratacao/veiculo",
     *     summary="Contratar seguro para veículo",
     *     description="Contrata um seguro associando-o a um veículo previamente cadastrado. O Cliente é inferido do veículo.",
     *     tags={"Contratação"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"veiculo_id", "seguro_id", "seguradora_id", "preco_id"},
     *             @OA\Property(property="veiculo_id", type="integer", description="ID do veículo"),
     *             @OA\Property(property="seguro_id", type="integer", description="ID do seguro"),
     *             @OA\Property(property="seguradora_id", type="integer", description="ID da seguradora"),
     *             @OA\Property(property="preco_id", type="integer", description="ID do preço selecionado"),
     *             @OA\Property(property="corretora_id", type="integer", description="ID da corretora (opcional)", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Contratação realizada com sucesso"
     *     )
     * )
     */
    public function contratar(Request $request)
    {
        // Validação básica do Request
        $validator = Validator::make($request->all(), [
            'veiculo_id' => 'required|integer|exists:veiculos,id_veiculo',
            'seguro_id' => 'required|integer',
            'seguradora_id' => 'required|integer',
            'preco_id' => 'required|integer|exists:precos,id_preco',
            'corretora_id' => 'nullable|integer|exists:corretoras,id_corretora',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validação de Integridade: Garantir que não é passado cliente_id
        if ($request->has('cliente_id')) {
            return response()->json([
                'message' => 'Violação de Segurança: Não é permitido enviar cliente_id manualmente. O cliente é inferido pelo veículo.'
            ], 403);
        }

        try {
            $contrato = $this->contratacaoService->contratar($request->all());

            return response()->json([
                'message' => 'Seguro contratado com sucesso',
                'data' => $contrato
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro na contratação: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao processar contratação',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
