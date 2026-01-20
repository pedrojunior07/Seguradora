<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pagamento;
use App\Models\Apolice;
use App\Models\ClienteSeguroVeiculo;
use App\Models\ClienteSeguroPropriedade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\AppNotification;

class PagamentoFicticioController extends Controller
{
    public function confirmarPagamento($id)
    {
        return DB::transaction(function () use ($id) {
            $pagamento = Pagamento::findOrFail($id);

            if ($pagamento->status === 'pago') {
                return response()->json(['message' => 'Este pagamento já foi confirmado.'], 400);
            }

            // 1. Atualizar Pagamento
            $pagamento->status = 'pago';
            $pagamento->data_pagamento = now();
            $pagamento->valor_pago = $pagamento->valor_parcela;
            $pagamento->save();

            // 2. Ativar Apólice
            $apolice = $pagamento->apolice;
            if ($apolice) {
                $apolice->status = 'ativa';
                $apolice->data_inicio_vigencia = now();
                $apolice->data_fim_vigencia = now()->addYear();
                $apolice->save();

                // 3. Ativar ClienteSeguro (Vínculo do Bem)
                if ($apolice->bem_segurado_type === \App\Models\Veiculo::class) {
                    $clienteSeguro = ClienteSeguroVeiculo::where('id_seguradora_seguro', $apolice->seguradora_seguro_id)
                        ->where('id_veiculo', $apolice->bem_segurado_id)
                        ->where('status', 'pendente')
                        ->first();
                } else {
                    $clienteSeguro = ClienteSeguroPropriedade::where('id_seguradora_seguro', $apolice->seguradora_seguro_id)
                        ->where('id_propriedade', $apolice->bem_segurado_id)
                        ->where('status', 'pendente')
                        ->first();
                }

                if ($clienteSeguro) {
                    $clienteSeguro->status = 'ativo';
                    // Nota: As tabelas ClienteSeguroVeiculo/Propriedade não parecem ter data_inicio/fim na migração base
                    // Mas se existirem, seriam atualizadas aqui.
                    $clienteSeguro->save();
                }

                // --- NOTIFICAÇÕES ---
                // 1. Notificar o Cliente
                $clienteUser = $apolice->cliente->user;
                if ($clienteUser) {
                    Notification::send($clienteUser, new AppNotification([
                        'titulo' => 'Pagamento Confirmado!',
                        'mensagem' => "O pagamento da sua apólice #{$apolice->numero_apolice} foi confirmado. O seu seguro está agora ativo!",
                        'tipo' => 'success',
                        'url_acao' => "/cliente/apolices/{$apolice->id_apolice}",
                        'id_objeto' => $apolice->id_apolice,
                        'tipo_objeto' => 'apolice'
                    ]));
                }

                // 2. Notificar a Seguradora
                $seguradoraUsers = $apolice->seguradoraSeguro->seguradora->users;
                if ($seguradoraUsers) {
                    Notification::send($seguradoraUsers, new AppNotification([
                        'titulo' => 'Novo Pagamento Confirmado',
                        'mensagem' => "O cliente {$apolice->cliente->nome} efetuou o pagamento da apólice #{$apolice->numero_apolice}.",
                        'tipo' => 'info',
                        'url_acao' => "/seguradora/propostas", // Ou página de apólices se houver
                        'id_objeto' => $apolice->id_apolice,
                        'tipo_objeto' => 'apolice'
                    ]));
                }
            }

            return response()->json([
                'message' => 'Pagamento confirmado com sucesso! O seguro está agora ativo.',
                'pagamento' => $pagamento,
                'apolice' => $apolice
            ]);
        });
    }
}
