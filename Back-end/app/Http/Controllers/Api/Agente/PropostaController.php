<?php

namespace App\Http\Controllers\Api\Agente;

use App\Http\Controllers\Controller;
use App\Models\Proposta;
use App\Models\Cliente;
use App\Models\AgenteSeguroSeguradora;
use App\Services\CotacaoService;
use App\Notifications\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Notification;

class PropostaController extends Controller
{
    protected $cotacaoService;

    public function __construct(CotacaoService $cotacaoService)
    {
        $this->cotacaoService = $cotacaoService;
    }

    /**
     * Listar propostas criadas pelo agente
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->perfil !== 'agente') {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agenteId = $user->perfil_id;

        $propostas = Proposta::where('agente_id', $agenteId)
            ->with(['seguradoraSeguro.seguro', 'bem', 'cliente', 'apolice'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($propostas);
    }

    /**
     * Criar nova venda (Proposta) pelo Agente
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->perfil !== 'agente') {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agenteId = $user->perfil_id;

        $validator = Validator::make($request->all(), [
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'id_seguradora_seguro' => 'required|integer|exists:seguradora_seguro,id',
            'valor_bem' => 'required|numeric|min:0',
            'id_bem' => 'required|integer',
            'tipo_bem' => 'required|string|in:veiculo,propriedade,frota',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar se o agente tem autorização para vender este seguro
        $autorizado = AgenteSeguroSeguradora::where('id_agente', $agenteId)
            ->where('id_seguro_seguradora', $request->id_seguradora_seguro)
            ->where('status', true)
            ->exists();

        if (!$autorizado) {
            return response()->json(['message' => 'Você não tem autorização para vender este seguro.'], 403);
        }

        $cliente = Cliente::findOrFail($request->id_cliente);

        try {
            $dados = $request->all();
            $dados['agente_id'] = $agenteId;

            $proposta = $this->cotacaoService->criarProposta($dados, $cliente);

            // Notificar a seguradora
            $seguradora = $proposta->seguradoraSeguro->seguradora;
            if ($seguradora) {
                Notification::send($seguradora->users, new AppNotification([
                    'titulo' => 'Nova Venda de Agente',
                    'mensagem' => "O Agente {$user->name} submeteu uma nova proposta para o cliente {$cliente->nome}.",
                    'tipo' => 'info',
                    'url_acao' => "/seguradora/propostas/{$proposta->id_proposta}",
                    'id_objeto' => $proposta->id_proposta,
                    'tipo_objeto' => 'proposta'
                ]));
            }

            return response()->json([
                'message' => 'Venda (Proposta) registada com sucesso! Aguarda aprovação da Seguradora.',
                'proposta' => $proposta
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao registar venda: ' . $e->getMessage()], 500);
        }
    }
}
