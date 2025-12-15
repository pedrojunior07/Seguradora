<?php

namespace App\Services;

use App\Models\Apolice;
use App\Models\Pagamento;
use App\Models\SeguradoraSeguro;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ApoliceService
{
    public function criarApolice(array $dados): Apolice
    {
        return DB::transaction(function () use ($dados) {
            $apolice = Apolice::create([
                'numero_apolice' => Apolice::gerarNumeroApolice(),
                'cliente_id' => $dados['cliente_id'],
                'seguradora_seguro_id' => $dados['seguradora_seguro_id'],
                'tipo_apolice' => $dados['tipo_apolice'],
                'bem_segurado_id' => $dados['bem_id'],
                'bem_segurado_type' => $dados['bem_type'],
                'agente_id' => $dados['agente_id'] ?? null,
                'corretora_id' => $dados['corretora_id'] ?? null,
                'data_emissao' => now(),
                'data_inicio_vigencia' => $dados['data_inicio'],
                'data_fim_vigencia' => $dados['data_fim'],
                'valor_segurado' => $dados['valor_segurado'],
                'premio_total' => $dados['premio_total'],
                'numero_parcelas' => $dados['numero_parcelas'],
                'franquia' => $dados['franquia'] ?? 0,
                'status' => 'pendente_aprovacao',
                'coberturas_selecionadas' => $dados['coberturas'] ?? [],
                'observacoes' => $dados['observacoes'] ?? null,
            ]);

            return $apolice;
        });
    }

    public function aprovarApolice(Apolice $apolice, User $aprovador): Apolice
    {
        return DB::transaction(function () use ($apolice, $aprovador) {
            $apolice->aprovar($aprovador);
            $apolice->ativar();

            // Gerar parcelas de pagamento
            $this->gerarParcelas($apolice);

            return $apolice->fresh();
        });
    }

    public function gerarParcelas(Apolice $apolice): void
    {
        $valorParcela = round($apolice->premio_total / $apolice->numero_parcelas, 2);
        $dataVencimento = $apolice->data_inicio_vigencia->copy();

        for ($i = 1; $i <= $apolice->numero_parcelas; $i++) {
            Pagamento::create([
                'numero_pagamento' => Pagamento::gerarNumeroPagamento(),
                'apolice_id' => $apolice->id_apolice,
                'cliente_id' => $apolice->cliente_id,
                'numero_parcela' => $i,
                'total_parcelas' => $apolice->numero_parcelas,
                'valor_parcela' => $valorParcela,
                'data_vencimento' => $dataVencimento->copy(),
                'status' => 'pendente',
            ]);

            $dataVencimento->addMonth();
        }
    }

    public function cancelarApolice(Apolice $apolice, User $cancelador, string $motivo): Apolice
    {
        return DB::transaction(function () use ($apolice, $cancelador, $motivo) {
            $apolice->cancelar($cancelador, $motivo);

            // Cancelar pagamentos pendentes
            $apolice->pagamentosPendentes()->update(['status' => 'cancelado']);

            return $apolice->fresh();
        });
    }

    public function calcularPremio(int $seguradoraSeguroId, float $valorBem, array $coberturasIds): array
    {
        $seguradoraSeguro = SeguradoraSeguro::with(['precoAtual', 'coberturas'])->findOrFail($seguradoraSeguroId);

        $preco = $seguradoraSeguro->precoAtual;
        if (!$preco) {
            throw new \Exception('Preço não configurado para este seguro');
        }

        $premioBase = $preco->usa_valor
            ? $preco->premio_valor
            : ($valorBem * $preco->premio_percentagem / 100);

        $coberturas = $seguradoraSeguro->coberturas()
            ->whereIn('id_cobertura', $coberturasIds)
            ->get();

        $franquiaTotal = $coberturas->sum('franquia');

        return [
            'premio_base' => round($premioBase, 2),
            'premio_total' => round($premioBase, 2),
            'franquia_total' => round($franquiaTotal, 2),
            'coberturas' => $coberturas,
        ];
    }

    public function verificarRenovacoes(int $diasAntecedencia = 30): \Illuminate\Database\Eloquent\Collection
    {
        return Apolice::proximaRenovacao($diasAntecedencia)
            ->with(['cliente', 'seguradoraSeguro.seguro', 'seguradoraSeguro.seguradora'])
            ->get();
    }

    public function renovarApolice(Apolice $apoliceOriginal, array $dadosNovos = []): Apolice
    {
        return DB::transaction(function () use ($apoliceOriginal, $dadosNovos) {
            $dados = [
                'cliente_id' => $apoliceOriginal->cliente_id,
                'seguradora_seguro_id' => $dadosNovos['seguradora_seguro_id'] ?? $apoliceOriginal->seguradora_seguro_id,
                'tipo_apolice' => $apoliceOriginal->tipo_apolice,
                'bem_id' => $apoliceOriginal->bem_segurado_id,
                'bem_type' => $apoliceOriginal->bem_segurado_type,
                'agente_id' => $dadosNovos['agente_id'] ?? $apoliceOriginal->agente_id,
                'corretora_id' => $dadosNovos['corretora_id'] ?? $apoliceOriginal->corretora_id,
                'data_inicio' => $apoliceOriginal->data_fim_vigencia->addDay(),
                'data_fim' => $apoliceOriginal->data_fim_vigencia->addDay()->addYear()->subDay(),
                'valor_segurado' => $dadosNovos['valor_segurado'] ?? $apoliceOriginal->valor_segurado,
                'premio_total' => $dadosNovos['premio_total'] ?? $apoliceOriginal->premio_total,
                'numero_parcelas' => $dadosNovos['numero_parcelas'] ?? $apoliceOriginal->numero_parcelas,
                'franquia' => $dadosNovos['franquia'] ?? $apoliceOriginal->franquia,
                'coberturas' => $dadosNovos['coberturas'] ?? $apoliceOriginal->coberturas_selecionadas,
                'observacoes' => 'Renovação da apólice ' . $apoliceOriginal->numero_apolice,
            ];

            return $this->criarApolice($dados);
        });
    }
}
