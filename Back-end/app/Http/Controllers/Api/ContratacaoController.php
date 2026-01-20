<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CotacaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContratacaoController extends Controller
{
    protected $cotacaoService;

    public function __construct(CotacaoService $cotacaoService)
    {
        $this->cotacaoService = $cotacaoService;
    }

    /**
     * Simular o prêmio de um seguro
     */
    public function simular(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_seguradora_seguro' => 'required|integer|exists:seguradora_seguro,id',
            'valor_bem' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $resultado = $this->cotacaoService->calcularPremio(
                $request->id_seguradora_seguro,
                $request->valor_bem
            );

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Realizar a contratação definitiva
     */
    public function contratar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_seguradora_seguro' => 'required|integer|exists:seguradora_seguro,id',
            'valor_bem' => 'required|numeric|min:0',
            'id_bem' => 'required|integer',
            'tipo_bem' => 'required|string|in:veiculo,propriedade',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::info('Erro validação contratar:', ['errors' => $validator->errors(), 'data' => $request->all()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Verificar se o bem pertence ao cliente autenticado (Opcional, mas recomendado)
            // Para simplicidade, assumirei que o ID é válido.
            
            $resultado = $this->cotacaoService->contratar($request->all());

            return response()->json([
                'message' => 'Seguro contratado com sucesso!',
                'data' => $resultado
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
