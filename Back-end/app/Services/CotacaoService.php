<?php

namespace App\Services;

use App\Models\Preco;
use App\Models\SeguradoraSeguro;
use App\Models\ClienteSeguroVeiculo;
use App\Models\ClienteSeguroPropriedade;
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

        if (!$preco) {
            throw new \Exception('Não existe um preço ativo para este seguro no momento.');
        }

        $premioFinal = 0;

        if ($preco->usa_valor) {
            // Valor Fixo
            $premioFinal = $preco->premio_valor;
        } else {
            // Percentagem
            $premioFinal = $valor_bem * ($preco->premio_percentagem / 100);
        }

        // Aplicar prêmio mínimo
        if ($seguradoraSeguro->premio_minimo > 0) {
            $premioFinal = max($premioFinal, $seguradoraSeguro->premio_minimo);
        }

        return [
            'id_seguradora_seguro' => $id_seguradora_seguro,
            'id_preco' => $preco->id,
            'valor_bem' => $valor_bem,
            'premio_final' => round($premioFinal, 2),
            'regra_aplicada' => $preco->usa_valor ? 'valor_fixo' : 'percentagem',
            'taxa_aplicada' => $preco->usa_valor ? $preco->premio_valor : $preco->premio_percentagem,
            'premio_minimo_aplicado' => $premioFinal == $seguradoraSeguro->premio_minimo && $seguradoraSeguro->premio_minimo > 0,
            'detalhes_cobertura' => $seguradoraSeguro->coberturas ?? []
        ];
    }

    /**
     * Realizar a contratação do seguro no modelo híbrido
     */
    public function contratar(array $dados): array
    {
        return DB::transaction(function () use ($dados) {
            $id_seguradora_seguro = $dados['id_seguradora_seguro'];
            $valor_bem = $dados['valor_bem'];
            $id_bem = $dados['id_bem'];
            $tipo_bem = $dados['tipo_bem']; // 'veiculo' ou 'propriedade'

            // Buscar regras do seguro
            $seguradoraSeguro = SeguradoraSeguro::findOrFail($id_seguradora_seguro);

            // Recalcular para garantir integridade e congelar o preço
            $cotacao = $this->calcularPremio($id_seguradora_seguro, $valor_bem);

            // Definir status inicial
            $status = 'proposta';
            
            // Lógica Híbrida: Aprovação Automática ou Análise
            if ($seguradoraSeguro->auto_aprovacao) {
                $status = 'ativo';
            } else {
                $status = 'em_analise';
            }

            if ($tipo_bem === 'veiculo') {
                // Upload de Fotos
                $fotos = [];
                $componentes = ['pneus', 'vidros', 'cadeiras', 'bagageira', 'eletronicos', 'acessorios'];
                
                foreach ($componentes as $comp) {
                    $key = "foto_{$comp}";
                    if (isset($dados[$key]) && $dados[$key] instanceof \Illuminate\Http\UploadedFile) {
                        $path = $dados[$key]->store("veiculos/{$id_bem}/avaliacoes", 'public');
                        $fotos[$key] = $path;
                    } else {
                        $fotos[$key] = null;
                    }
                }

                $registro = ClienteSeguroVeiculo::create([
                    'id_veiculo' => $id_bem,
                    'id_seguradora_seguro' => $id_seguradora_seguro,
                    'id_preco' => $cotacao['id_preco'],
                    'valor_bem' => $valor_bem,
                    'premio_final' => $cotacao['premio_final'],
                    'status' => $status,
                    'quilometragem_atual' => $dados['quilometragem_atual'] ?? null,
                    'tipo_uso' => $dados['tipo_uso'] ?? null,
                    'estado_pneus' => $dados['estado_pneus'] ?? null,
                    'estado_vidros' => $dados['estado_vidros'] ?? null,
                    'estado_cadeiras' => $dados['estado_cadeiras'] ?? null,
                    'estado_bagageira' => $dados['estado_bagageira'] ?? null,
                    'estado_eletronicos' => $dados['estado_eletronicos'] ?? null,
                    'estado_acessorios' => $dados['estado_acessorios'] ?? null,
                    'foto_pneus' => $fotos['foto_pneus'],
                    'foto_vidros' => $fotos['foto_vidros'],
                    'foto_cadeiras' => $fotos['foto_cadeiras'],
                    'foto_bagageira' => $fotos['foto_bagageira'],
                    'foto_eletronicos' => $fotos['foto_eletronicos'],
                    'foto_acessorios' => $fotos['foto_acessorios'],
                ]);
            } else {
                $registro = ClienteSeguroPropriedade::create([
                    'id_propriedade' => $id_bem,
                    'id_seguradora_seguro' => $id_seguradora_seguro,
                    'id_preco' => $cotacao['id_preco'],
                    'valor_bem' => $valor_bem,
                    'premio_final' => $cotacao['premio_final'],
                    'status' => $status,
                ]);
            }

            return [
                'sucesso' => true,
                'status' => $status,
                'contratacao' => $registro,
                'cotacao' => $cotacao,
                'mensagem' => $status === 'ativo' ? 'Seguro ativado com sucesso!' : 'Sua proposta foi enviada para análise da seguradora.'
            ];
        });
    }
}
