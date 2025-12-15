<?php

namespace App\Http\Controllers\Corretora;

use App\Http\Controllers\Controller;
use App\Http\Requests\Corretora\StorePropostaRequest;
use App\Models\Apolice;
use App\Models\Proposta;
use App\Services\ApoliceService;
use Illuminate\Http\Request;

class PropostaController extends Controller
{
    public function __construct(protected ApoliceService $apoliceService) {}

    public function index(Request $request)
    {
        $propostas = Proposta::where('corretora_id', $request->user()->perfil_id)
            ->with(['cliente', 'seguradoraSeguro.seguro', 'bem'])
            ->paginate(20);

        return response()->json($propostas);
    }

    public function store(StorePropostaRequest $request)
    {
        try {
            $dados = $request->validated();
            $dados['corretora_id'] = $request->user()->perfil_id;
            $dados['numero_proposta'] = Proposta::gerarNumeroProposta();
            $dados['status'] = 'rascunho';
            $dados['data_inicio_proposta'] = now();
            $dados['data_fim_proposta'] = now()->addDays(30);
            $dados['validade_proposta'] = now()->addDays(30);

            // Calcular prémio
            $calculo = $this->apoliceService->calcularPremio(
                $dados['seguradora_seguro_id'],
                $dados['valor_bem'],
                $dados['coberturas_selecionadas']
            );

            $dados['premio_calculado'] = $calculo['premio_total'];

            $proposta = Proposta::create($dados);

            return response()->json([
                'message' => 'Proposta criada com sucesso',
                'proposta' => $proposta->load(['cliente', 'seguradoraSeguro']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar proposta',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(Proposta $proposta, Request $request)
    {
        if ($proposta->corretora_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json($proposta->load([
            'cliente',
            'seguradoraSeguro.seguro',
            'seguradoraSeguro.coberturas',
            'bem',
        ]));
    }

    public function enviar(Proposta $proposta, Request $request)
    {
        if ($proposta->corretora_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        if (!$proposta->enviar()) {
            return response()->json([
                'message' => 'Não é possível enviar esta proposta',
            ], 400);
        }

        return response()->json([
            'message' => 'Proposta enviada',
            'proposta' => $proposta->fresh(),
        ]);
    }

    public function converterEmApolice(Proposta $proposta, Request $request)
    {
        if ($proposta->corretora_id !== $request->user()->perfil_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        if ($proposta->status !== 'aprovada') {
            return response()->json([
                'message' => 'Apenas propostas aprovadas podem ser convertidas',
            ], 400);
        }

        try {
            $apolice = Apolice::create([
                'numero_apolice' => Apolice::gerarNumeroApolice(),
                'cliente_id' => $proposta->cliente_id,
                'seguradora_seguro_id' => $proposta->seguradora_seguro_id,
                'tipo_apolice' => $proposta->tipo_proposta,
                'bem_segurado_id' => $proposta->bem_id,
                'bem_segurado_type' => $proposta->bem_type,
                'corretora_id' => $proposta->corretora_id,
                'agente_id' => $proposta->agente_id,
                'data_emissao' => now(),
                'data_inicio_vigencia' => $proposta->data_inicio_proposta,
                'data_fim_vigencia' => $proposta->data_fim_proposta,
                'valor_segurado' => $proposta->valor_bem,
                'premio_total' => $proposta->premio_calculado,
                'numero_parcelas' => $proposta->parcelas_sugeridas,
                'status' => 'pendente_aprovacao',
                'coberturas_selecionadas' => $proposta->coberturas_selecionadas,
            ]);

            $proposta->converterEmApolice($apolice);

            return response()->json([
                'message' => 'Apólice gerada a partir da proposta',
                'apolice' => $apolice,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao converter proposta',
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
