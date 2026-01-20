<?php

namespace App\Services;

use App\Models\Preco;
use App\Models\SeguradoraSeguro;
use App\Models\Proposta;
use App\Models\Veiculo;
use App\Models\Propriedade;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CotacaoService
{
    /**
     * Calcular o prêmio de um seguro baseado no valor do bem
     */
    public function calcularPremio(int $id_seguradora_seguro, float $valor_bem): array
    {
        $seguradoraSeguro = SeguradoraSeguro::with(['precoAtual', 'seguro.tipo'])->findOrFail($id_seguradora_seguro);
        
        $preco = $seguradoraSeguro->precoAtual;

        // Fallback de segurança: Se a relação falhar, tenta buscar manualmente
        if (!$preco) {
            $preco = \App\Models\Preco::where('seguradora_seguro_id', $seguradoraSeguro->id)
                ->whereDate('data_inicio', '<=', now())
                ->where(function ($query) {
                    $query->whereNull('data_fim')
                          ->orWhereDate('data_fim', '>=', now());
                })
                ->latest('data_inicio')
                ->latest('id')
                ->first();
        }

        // ULTIMATE FALLBACK
        if (!$preco) {
             $preco = \App\Models\Preco::where('seguradora_seguro_id', $seguradoraSeguro->id)
                ->orderBy('id', 'desc')
                ->first();
        }

        $premioBase = 0;

        if ($preco->usa_valor) {
            // Valor Fixo
            $premioBase = $preco->premio_valor;
        } else {
            // Percentagem
            $premioBase = $valor_bem * ($preco->premio_percentagem / 100);
        }

        // Aplicar prêmio mínimo
        $premioFinal = $premioBase;
        if ($seguradoraSeguro->premio_minimo > 0) {
            $premioFinal = max($premioFinal, $seguradoraSeguro->premio_minimo);
        }

        return [
            'id_seguradora_seguro' => $id_seguradora_seguro,
            'id_preco' => $preco->id,
            'valor_bem' => $valor_bem,
            'premio_base' => round($premioBase, 2),
            'premio_final' => round($premioFinal, 2),
            'regra_aplicada' => $preco->usa_valor ? 'valor_fixo' : 'percentagem',
            'taxa_aplicada' => $preco->usa_valor ? $preco->premio_valor : $preco->premio_percentagem,
            'premio_minimo_aplicado' => $premioFinal == $seguradoraSeguro->premio_minimo && $seguradoraSeguro->premio_minimo > 0,
            'detalhes_cobertura' => $seguradoraSeguro->coberturas ?? []
        ];
    }

    /**
     * Criar uma nova proposta (Substitui a contratação direta)
     */
    public function criarProposta(array $dados, $cliente): Proposta
    {
        return DB::transaction(function () use ($dados, $cliente) {
            $cotacao = $this->calcularPremio($dados['id_seguradora_seguro'], $dados['valor_bem']);

            // Identificar o bem
            $bemType = null;
            $bemId = $dados['id_bem'];

            if ($dados['tipo_bem'] === 'veiculo') {
                $bemType = Veiculo::class;
                // Verificar propriedade
                $veiculo = Veiculo::findOrFail($bemId);
                if ($veiculo->id_cliente !== $cliente->id_cliente) {
                    throw new \Exception("Veículo não pertence ao cliente.");
                }
            } else {
                $bemType = Propriedade::class;
                 $propriedade = Propriedade::findOrFail($bemId);
                 if ($propriedade->id_cliente !== $cliente->id_cliente) {
                    throw new \Exception("Propriedade não pertence ao cliente.");
                }
            }

            // Criar Proposta
            $proposta = new Proposta();
            $proposta->numero_proposta = Proposta::gerarNumeroProposta();
            $proposta->cliente_id = $cliente->id_cliente;
            $proposta->seguradora_seguro_id = $dados['id_seguradora_seguro'];
            $proposta->tipo_proposta = $dados['tipo_bem'];
            $proposta->bem_id = $bemId;
            $proposta->bem_type = $bemType;
            
            // Valores
            $proposta->valor_bem = $cotacao['valor_bem'];
            $proposta->premio_calculado = $cotacao['premio_final'];
            $proposta->coberturas_selecionadas = $cotacao['detalhes_cobertura'];
            
            // Vigência da Proposta (Validade da oferta)
            $proposta->data_inicio_proposta = now();
            $proposta->data_fim_proposta = now()->addYear(); // Exemplo: proposta de um seguro anual
            $proposta->validade_proposta = now()->addDays(15); // Proposta expira em 15 dias se não aprovada
            
            $proposta->status = 'em_analise';
            
            $proposta->save();

            return $proposta;
        });
    }

    // Método antigo de contratação direta mantido apenas para referência ou legados simples
    // Pode ser removido futuramente se mudarmos 100% para o fluxo de proposta
}
