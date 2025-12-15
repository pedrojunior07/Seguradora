<?php

namespace App\Services;

use App\Models\Apolice;
use App\Models\Comissao;
use App\Models\CorretoraSeguradora;
use Illuminate\Support\Facades\DB;

class ComissaoService
{
    public function calcularComissaoApolice(Apolice $apolice): ?array
    {
        if (!$apolice->corretora_id) {
            return null;
        }

        $parceria = CorretoraSeguradora::where('id_corretora', $apolice->corretora_id)
            ->whereHas('seguradora', function ($q) use ($apolice) {
                $q->whereHas('seguradoraSeguros', function ($q2) use ($apolice) {
                    $q2->where('id', $apolice->seguradora_seguro_id);
                });
            })
            ->where('status', 'aprovada')
            ->first();

        if (!$parceria) {
            return null;
        }

        $baseCalculo = $apolice->premio_total;
        $percentagem = $parceria->comissao_percentagem;
        $valorComissao = round($baseCalculo * $percentagem / 100, 2);

        return [
            'base_calculo' => $baseCalculo,
            'percentagem' => $percentagem,
            'valor_comissao' => $valorComissao,
            'corretora_id' => $apolice->corretora_id,
            'apolice_id' => $apolice->id_apolice,
        ];
    }

    public function registrarComissao(Apolice $apolice): ?Comissao
    {
        $dadosComissao = $this->calcularComissaoApolice($apolice);

        if (!$dadosComissao) {
            return null;
        }

        return DB::transaction(function () use ($dadosComissao, $apolice) {
            // Buscar o relacionamento corretora_seguroseguradora
            $corretoraSeguroSeguradora = DB::table('corretora_seguroseguradora')
                ->where('id_corretora', $apolice->corretora_id)
                ->where('id_seguro_seguradora', $apolice->seguradora_seguro_id)
                ->first();

            if (!$corretoraSeguroSeguradora) {
                return null;
            }

            // Buscar prop_cliente_seg_seguro se existir
            $propClienteSegSeguro = DB::table('prop_cliente_seg_seguro')
                ->where('seguradora_seguro_id', $apolice->seguradora_seguro_id)
                ->first();

            return Comissao::create([
                'corretora_seguro_seguradora_id' => $corretoraSeguroSeguradora->id,
                'prop_cliente_seg_seguro_id' => $propClienteSegSeguro?->id ?? 1,
                'base_calculo' => $dadosComissao['base_calculo'],
                'percentagem' => $dadosComissao['percentagem'],
                'valor_comissao' => $dadosComissao['valor_comissao'],
                'estado' => 'pendente',
                'data_calculo' => now(),
            ]);
        });
    }

    public function pagarComissao(Comissao $comissao): bool
    {
        if ($comissao->estado !== 'pendente') {
            return false;
        }

        $comissao->estado = 'paga';
        $comissao->data_pagamento = now();
        return $comissao->save();
    }

    public function listarComissoesPendentes(int $corretoraId): \Illuminate\Database\Eloquent\Collection
    {
        return Comissao::whereHas('corretoraSeguroSeguradora', function ($q) use ($corretoraId) {
            $q->where('id_corretora', $corretoraId);
        })
        ->where('estado', 'pendente')
        ->with(['corretoraSeguroSeguradora'])
        ->get();
    }

    public function totalizarComissoes(int $corretoraId, ?string $periodo = null): array
    {
        $query = Comissao::whereHas('corretoraSeguroSeguradora', function ($q) use ($corretoraId) {
            $q->where('id_corretora', $corretoraId);
        });

        if ($periodo) {
            $query->whereMonth('data_calculo', now()->month)
                  ->whereYear('data_calculo', now()->year);
        }

        return [
            'total_pendente' => $query->clone()->where('estado', 'pendente')->sum('valor_comissao'),
            'total_pago' => $query->clone()->where('estado', 'paga')->sum('valor_comissao'),
            'quantidade_pendente' => $query->clone()->where('estado', 'pendente')->count(),
            'quantidade_pago' => $query->clone()->where('estado', 'paga')->count(),
        ];
    }
}
