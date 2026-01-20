<?php

namespace App\Http\Controllers\Api\Seguradora;

use App\Http\Controllers\Controller;
use App\Models\Proposta;
use App\Models\Apolice;
use App\Models\ClienteSeguroVeiculo;
use App\Models\ClienteSeguroPropriedade;
use App\Models\Veiculo;
use App\Models\Propriedade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\AppNotification;
use App\Models\AuditLog;
use Carbon\Carbon;

class PropostaController extends Controller
{
    public function index(Request $request)
    {
        $query = Proposta::with(['cliente', 'seguradoraSeguro.seguro', 'bem', 'latestAuditLog.user']);

        // Filtrar por seguradora do utilizador autenticado
        $seguradoraId = auth()->user()->seguradora_id;
        if ($seguradoraId) {
            $query->whereHas('seguradoraSeguro', function($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Ordenar por mais recente
        $query->orderBy('created_at', 'desc');

        return response()->json($query->paginate(20));
    }

    public function recentNotifications()
    {
        $seguradoraId = auth()->user()->seguradora_id;
        
        $query = Proposta::with(['cliente', 'seguradoraSeguro.seguro'])
            ->whereIn('status', ['enviada', 'em_analise']);

        if ($seguradoraId) {
            $query->whereHas('seguradoraSeguro', function($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            });
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($notifications);
    }

    public function show($id)
    {
        $proposta = Proposta::with([
            'cliente', 
            'seguradoraSeguro.seguro', 
            'bem' => function($morphTo) {
                $morphTo->morphWith([
                    \App\Models\Veiculo::class => ['fotos'],
                ]);
            },
            'apolice.pagamentos'
        ])->findOrFail($id);
        
        return response()->json($proposta);
    }

    public function aprovar(Request $request, $id)
    {
        $proposta = Proposta::findOrFail($id);

        if ($proposta->status !== 'em_analise') {
            return response()->json(['message' => 'Apenas propostas em análise podem ser aprovadas.'], 400);
        }

        return DB::transaction(function () use ($proposta) {
            // 1. Criar ClienteSeguro (Vínculo do Bem com o Seguro) - Inicialmente Pendente
            $clienteSeguro = null;
            $idPreco = $proposta->seguradoraSeguro->precoAtual->id ?? null;
            
            if ($proposta->tipo_proposta === 'veiculo') {
                 $clienteSeguro = new ClienteSeguroVeiculo();
                 $clienteSeguro->id_veiculo = $proposta->bem_id;
                 $clienteSeguro->id_seguradora_seguro = $proposta->seguradora_seguro_id;
                 $clienteSeguro->id_preco = $idPreco;
                 $clienteSeguro->valor_bem = $proposta->valor_bem;
                 $clienteSeguro->premio_final = $proposta->premio_calculado; // Corrigido de valor_premio
                 $clienteSeguro->status = 'pendente';
                 $clienteSeguro->save();
            } else {
                 $clienteSeguro = new ClienteSeguroPropriedade();
                 $clienteSeguro->id_propriedade = $proposta->bem_id;
                 $clienteSeguro->id_seguradora_seguro = $proposta->seguradora_seguro_id;
                 $clienteSeguro->id_preco = $idPreco;
                 $clienteSeguro->valor_bem = $proposta->valor_bem;
                 $clienteSeguro->premio_final = $proposta->premio_calculado; // Corrigido de valor_premio
                 $clienteSeguro->status = 'pendente';
                 $clienteSeguro->save();
            }

            // 2. Criar a Apólice - Status Aguardando Pagamento
            $apolice = new Apolice();
            $apolice->numero_apolice = 'AP' . time() . rand(1000, 9999);
            $apolice->cliente_id = $proposta->cliente_id; // Corrigido de id_cliente
            $apolice->seguradora_seguro_id = $proposta->seguradora_seguro_id;
            $apolice->tipo_apolice = $proposta->tipo_proposta; // Adicionado tipo_apolice
            $apolice->bem_segurado_id = $proposta->bem_id;
            $apolice->bem_segurado_type = $proposta->bem_type;
            
            // Vigência será definida apenas após o pagamento
            $apolice->data_emissao = now();
            // A migração exige data_inicio_vigencia e data_fim_vigencia (not null?)
            // Vou colocar as datas da proposta como provisórias ou agora() + 1 ano
            $apolice->data_inicio_vigencia = now(); 
            $apolice->data_fim_vigencia = now()->addYear();
            
            $apolice->valor_segurado = $proposta->valor_bem; // Adicionado valor_segurado
            $apolice->premio_total = $proposta->premio_calculado;
            $apolice->status = 'pendente_aprovacao'; // Usando um status existente para evitar erro de enum
            $apolice->save();

            // 3. Gerar Ordem de Pagamento
            $pagamento = new \App\Models\Pagamento();
            $pagamento->numero_pagamento = \App\Models\Pagamento::gerarNumeroPagamento();
            $pagamento->apolice_id = $apolice->id_apolice;
            $pagamento->cliente_id = $proposta->cliente_id;
            $pagamento->numero_parcela = 1;
            $pagamento->total_parcelas = 1; // Simplificação: pagamento único para ativação
            $pagamento->valor_parcela = $proposta->premio_calculado;
            $pagamento->data_vencimento = now()->addDays(3);
            $pagamento->status = 'pendente';
            $pagamento->save();

            // 4. Atualizar Proposta
            $oldState = $proposta->toArray();
            $proposta->status = 'aprovada';
            $proposta->apolice_gerada_id = $apolice->id_apolice;
            $proposta->save();

            AuditLog::log('aprovar', $proposta, "Proposta aprovada e convertida em apólice #{$apolice->id_apolice}", $oldState, $proposta->fresh()->toArray());

            // Notificar o cliente
            $clienteUser = $proposta->cliente->user;
            if ($clienteUser) {
                Notification::send($clienteUser, new AppNotification([
                    'titulo' => 'Sua Proposta foi Aprovada!',
                    'mensagem' => "A sua proposta para o seguro {$proposta->seguradoraSeguro->seguro->nome} foi aprovada. Por favor, realize o pagamento para ativar a apólice.",
                    'tipo' => 'success',
                    'url_acao' => "/cliente/pagamentos",
                    'id_objeto' => $apolice->id_apolice,
                    'tipo_objeto' => 'apolice'
                ]));
            }

            return response()->json([
                'message' => 'Proposta aprovada! Ordem de pagamento gerada. A apólice será ativada após a confirmação do pagamento.',
                'apolice' => $apolice,
                'pagamento' => $pagamento
            ]);
        });
    }

    public function rejeitar(Request $request, $id)
    {
        $request->validate([
            'motivo' => 'required|string|max:255'
        ]);

        $proposta = Proposta::findOrFail($id);

        if ($proposta->status !== 'em_analise') {
            return response()->json(['message' => 'Esta proposta não pode ser rejeitada.'], 400);
        }

        $oldState = $proposta->toArray();
        $proposta->status = 'rejeitada';
        $proposta->motivo_rejeicao = $request->motivo;
        $proposta->save();

        AuditLog::log('rejeitar', $proposta, "Proposta rejeitada. Motivo: {$request->motivo}", $oldState, $proposta->fresh()->toArray());

        // Notificar o cliente
        $clienteUser = $proposta->cliente->user;
        if ($clienteUser) {
            Notification::send($clienteUser, new AppNotification([
                'titulo' => 'Proposta Rejeitada',
                'mensagem' => "Lamentamos, mas a sua proposta para o seguro {$proposta->seguradoraSeguro->seguro->nome} foi rejeitada. Motivo: {$request->motivo}",
                'tipo' => 'error',
                'url_acao' => "/cliente/minhas-propostas",
                'id_objeto' => $proposta->id_proposta,
                'tipo_objeto' => 'proposta'
            ]));
        }

        return response()->json(['message' => 'Proposta rejeitada com sucesso.']);
    }
}
