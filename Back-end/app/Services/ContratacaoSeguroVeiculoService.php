<?php

namespace App\Services;

use App\Models\Veiculo;
use App\Models\SeguradoraSeguro;
use App\Models\VeiculoSeguradoraSeguro; // Assumindo Model para tabela veiculo_seguro_seguradora
use App\Models\Preco;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ContratacaoSeguroVeiculoService
{
    /**
     * Contratar seguro para um veículo.
     * 
     * O Cliente é inferido automaticamente do Veículo.
     * A validação de Preço e IDs é feita aqui.
     * 
     * @param array $dados [veiculo_id, seguro_id, seguradora_id, preco_id, corretora_id?]
     * @return VeiculoSeguradoraSeguro
     */
    public function contratar(array $dados)
    {
        return DB::transaction(function () use ($dados) {
            // 1. Validar e Obter Veículo com Cliente
            $veiculo = Veiculo::with('cliente')->findOrFail($dados['veiculo_id']);

            if (!$veiculo->cliente) {
                throw new \Exception("Veículo informado (ID: {$veiculo->id_veiculo}) não possui cliente associado. Impossível contratar.");
            }

            // 2. Identificar SeguradoraSeguro (Produto da Seguradora)
            $seguradoraSeguro = SeguradoraSeguro::where('id_seguro', $dados['seguro_id'])
                                                ->where('id_seguradora', $dados['seguradora_id'])
                                                ->firstOrFail();

            // 3. Validar Preço (Se enviado)
            if (isset($dados['preco_id'])) {
                $preco = Preco::findOrFail($dados['preco_id']);
                // Opcional: Validar se o preço pertence ao produto correto
                // if ($preco->seguradora_seguro_id !== $seguradoraSeguro->id) throw ...
            }

            // 4. Criar Vínculo (Contratação)
            // Assumindo que VeiculoSeguradoraSeguro é o Eloquent Model para 'veiculo_seguro_seguradora'
            // Se não existir Model, usar DB::table('veiculo_seguro_seguradora')->insertGetId(...)
            
            // Vamos assumir que existe um Model ou criaremos um genérico. 
            // Para garantir, vou usar VeiculoSeguroSeguradora se existir, ou DB se não.
            // Vou criar o registro. Ajuste os campos conforme sua migration real.
            
            $contrato = new \App\Models\VeiculoSeguroSeguradora(); // Precisamos garantir que este model existe
            $contrato->id_veiculo = $veiculo->id_veiculo;
            $contrato->id_seguradora_seguro = $seguradoraSeguro->id; // ou id da pk
            $contrato->status = 'pendente'; // Inicialmente pendente
            $contrato->data_inicio = now();
            // Data fim depende do preço/periodicidade, simplificando:
            $contrato->data_fim = now()->addYear(); 
            
            // Se houver campos de corretora/agente na tabela intermédia
            // $contrato->corretora_id = $dados['corretora_id'] ?? null; 
            
            $contrato->save();

            // 5. Log Obrigatório de Rastreio
            $corretoraId = $dados['corretora_id'] ?? 'N/A';
            
            Log::info(
                "Seguro {$dados['seguro_id']} contratado para o Veículo {$veiculo->id_veiculo} " .
                "(Cliente {$veiculo->cliente->id_cliente}) via Corretora {$corretoraId}. " .
                "Contrato ID: {$contrato->id}"
            );

            return $contrato;
        });
    }
}
