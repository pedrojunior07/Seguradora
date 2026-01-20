<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposta;
use App\Services\CotacaoService;
use App\Notifications\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
     * Listar propostas do cliente autenticado.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user->cliente) {
                return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
            }

            $propostas = Proposta::doCliente($user->cliente->id_cliente)
                ->with(['seguradoraSeguro.seguro', 'bem', 'apolice.pagamentos']) // Eager loading
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['data' => $propostas]);
        } catch (\Exception $e) {
            \Log::error("Erro ao listar propostas: " . $e->getMessage());
            return response()->json(['message' => 'Erro ao buscar propostas.'], 500);
        }
    }

    /**
     * Criar uma nova proposta de seguro.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_seguradora_seguro' => 'required|integer|exists:seguradora_seguro,id',
            'valor_bem' => 'required|numeric|min:0',
            'id_bem' => 'required|integer',
            'tipo_bem' => 'required|string|in:veiculo,propriedade',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = Auth::user();
            if (!$user->cliente) {
                return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
            }

            // Usar o service para criar a proposta
            $proposta = $this->cotacaoService->criarProposta($request->all(), $user->cliente);

            // Notificar utilizadores da seguradora
            $seguradora = $proposta->seguradoraSeguro->seguradora;
            if ($seguradora) {
                $status = Notification::send($seguradora->users, new AppNotification([
                    'titulo' => 'Nova Proposta Recebida',
                    'mensagem' => $user->cliente->nome . ' enviou uma nova proposta de ' . $proposta->seguradoraSeguro->seguro->nome,
                    'tipo' => 'info',
                    'url_acao' => "/seguradora/propostas/{$proposta->id_proposta}",
                    'id_objeto' => $proposta->id_proposta,
                    'tipo_objeto' => 'proposta'
                ]));
            }

            return response()->json([
                'message' => 'Proposta enviada com sucesso! Aguarde a análise.',
                'data' => $proposta
            ], 201);

        } catch (\Exception $e) {
            \Log::error("Erro ao criar proposta: " . $e->getMessage());
            return response()->json(['message' => 'Erro ao enviar proposta: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Exibir detalhes de uma proposta.
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            if (!$user->cliente) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $proposta = Proposta::doCliente($user->cliente->id_cliente)
                ->with(['seguradoraSeguro.seguro', 'bem', 'seguradoraSeguro.seguradora'])
                ->findOrFail($id);

            return response()->json($proposta);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Proposta não encontrada.'], 404);
        }
    }
    public function recentNotifications()
    {
        try {
            $user = Auth::user();
            if (!$user->cliente) {
                return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
            }

            // Buscar propostas que foram aprovadas ou rejeitadas recentemente
            $notifications = Proposta::doCliente($user->cliente->id_cliente)
                ->with(['seguradoraSeguro.seguro', 'seguradoraSeguro.seguradora'])
                ->whereIn('status', ['aprovada', 'rejeitada'])
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json($notifications);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao buscar notificações.'], 500);
        }
    }
}
