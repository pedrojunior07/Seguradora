<?php

namespace App\Services;

use App\Models\Seguro;
use App\Models\Veiculo;
use App\Models\Cliente;
use App\Models\SeguradoraSeguro;
use App\Models\DetalhesCobertura;
use Illuminate\Support\Facades\Log;

class CotacaoService
{
    /**
     * Calcular Prémio para Seguro de Danos Próprios (Automóvel)
     * e Rastrear vínculo Cliente-Corretora via Veículo.
     *
     * @param int $veiculoId
     * @param int $seguroId
     * @param array $coberturasIds
     * @param int|null $corretoraId (Opcional, para rastreio de origem)
     * @return array
     */
    public function calcularPremioDanosProprios(int $veiculoId, int $seguroId, array $coberturasIds, ?int $corretoraId = null)
    {
        // 1. Validar Veículo e Cliente (Fluxo: Veiculo -> Cliente)
        $veiculo = Veiculo::with('cliente')->findOrFail($veiculoId);
        
        if (!$veiculo->cliente) {
            Log::error("Tentativa de cotação para veículo sem cliente. ID: {$veiculoId}");
            throw new \Exception("Veículo não possui cliente associado.");
        }

        $cliente = $veiculo->cliente;

        // 2. Rastreio (Logging)
        // Aqui cumprimos o requisito de rastreio "Cliente-Corretora" sem alterar a tabela Cliente
        Log::info("Cotação Danos Próprios Iniciada", [
            'veiculo_id' => $veiculo->id_veiculo,
            'cliente_id' => $cliente->id_cliente,
            'cliente_nome' => $cliente->nome,
            'corretora_origem_id' => $corretoraId ?? 'N/A (Direto ou Seguradora)',
            'valor_veiculo' => $veiculo->valor_estimado
        ]);

        // 3. Obter dados do Seguro e Preços Base
        $seguro = Seguro::findOrFail($seguroId);
        // Assumindo que o produto está configurado na pivot (como feito no Seeder)
        $seguradoraSeguro = SeguradoraSeguro::where('id_seguro', $seguroId)->firstOrFail();

        // 4. Lógica de Cálculo (Simplificada)
        // Prémio Base = % do Valor do Veículo (ex: 1.5%)
        $taxaBase = 0.015; 
        $premioBase = $veiculo->valor_estimado * $taxaBase;

        // Adicionar Coberturas
        $coberturas = DetalhesCobertura::whereIn('id_cobertura', $coberturasIds)
                                      ->where('id_seguro_seguradora', $seguradoraSeguro->id)
                                      ->get();

        $valorCoberturas = 0;
        foreach ($coberturas as $cobertura) {
            // Se a cobertura tiver um custo fixo (exemplo hipotético, caso adicionassemos 'preco' na tabela)
            // Como não tem, vamos simular um custo baseado na franquia ou fixo por item
            // Para demo: cada cobertura adiciona 0.5% do valor do carro ou um fixo
            $valorCoberturas += 1000; // Valor fixo por cobertura extra na demo
        }

        $premioTotal = $premioBase + $valorCoberturas;

        // Garantir prémio mínimo
        if ($premioTotal < $seguradoraSeguro->premio_minimo) {
            $premioTotal = $seguradoraSeguro->premio_minimo;
        }

        // 5. Retornar Resultado
        return [
            'cliente' =>WrapperCliente($cliente),
            'veiculo' => $veiculo->matricula,
            'valor_veiculo' => $veiculo->valor_estimado,
            'premio_base' => $premioBase,
            'total_coberturas' => $valorCoberturas,
            'premio_final' => $premioTotal,
            'coberturas_selecionadas' => $coberturas->pluck('nome'),
            'rastreio_id' => uniqid('cot_'), // ID de rastreio para referência futura
        ];
    }
}

function WrapperCliente($cliente) {
    return [
        'id' => $cliente->id_cliente,
        'nome' => $cliente->nome,
        'nuit' => $cliente->nuit
    ];
}
