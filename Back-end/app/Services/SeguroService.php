<?php

namespace App\Services;

use App\Models\Categoria;
use App\Models\Seguro;
use App\Models\SeguradoraSeguro;
use App\Models\Preco;
use App\Models\DetalhesCobertura;
use Illuminate\Support\Facades\DB;

class SeguroService
{
    /**
     * Criar um novo seguro com todas as informações relacionadas
     */
    public function criarSeguro(array $dados, int $id_seguradora): array
    {
        return DB::transaction(function () use ($dados, $id_seguradora) {
            // 1. Criar o seguro
            $seguro = Seguro::create([
                'id_categoria' => $dados['id_categoria'],
                'nome' => $dados['nome'],
                'descricao' => $dados['descricao'] ?? null,
                'tipo_seguro' => $dados['tipo_seguro'],
            ]);

            // 2. Criar associação seguradora_seguro
            $seguradoraSeguro = SeguradoraSeguro::create([
                'id_seguro' => $seguro->id_seguro,
                'id_seguradora' => $id_seguradora,
                'premio_minimo' => $dados['premio_minimo'],
                'valor_minimo_dano' => $dados['valor_minimo_dano'] ?? null,
                'status' => $dados['status'] ?? true,
            ]);

            // 3. Criar preço inicial (se fornecido)
            if (isset($dados['preco'])) {
                Preco::create([
                    'seguradora_seguro_id' => $seguradoraSeguro->id,
                    'valor' => $dados['preco']['valor'],
                    'premio_percentagem' => $dados['preco']['premio_percentagem'] ?? null,
                    'premio_valor' => $dados['preco']['premio_valor'] ?? null,
                    'usa_valor' => $dados['preco']['usaValor'] ?? false,
                    'data_inicio' => $dados['preco']['data_inicio'] ?? now(),
                    'data_fim' => $dados['preco']['data_fim'] ?? null,
                ]);
            }

            // 4. Criar coberturas (se fornecidas)
            if (isset($dados['coberturas']) && is_array($dados['coberturas'])) {
                foreach ($dados['coberturas'] as $cobertura) {
                    DetalhesCobertura::create([
                        'id_seguro_seguradora' => $seguradoraSeguro->id,
                        'descricao' => $cobertura['descricao'],
                        'franquia' => $cobertura['franquia'] ?? null,
                        'valor_maximo' => $cobertura['valor_minimo'] ?? null,
                    ]);
                }
            }

            return [
                'seguro' => $seguro->load('categoria'),
                'seguradoraSeguro' => $seguradoraSeguro->load(['precoAtual', 'coberturas']),
            ];
        });
    }

    /**
     * Atualizar um seguro existente
     */
    public function atualizarSeguro(int $id_seguro, array $dados): Seguro
    {
        $seguro = Seguro::findOrFail($id_seguro);

        $seguro->update([
            'id_categoria' => $dados['id_categoria'] ?? $seguro->id_categoria,
            'nome' => $dados['nome'] ?? $seguro->nome,
            'descricao' => $dados['descricao'] ?? $seguro->descricao,
            'tipo_seguro' => $dados['tipo_seguro'] ?? $seguro->tipo_seguro,
        ]);

        return $seguro->fresh('categoria');
    }

    /**
     * Atualizar configurações de seguro para uma seguradora específica
     */
    public function atualizarSeguradoraSeguro(int $id, array $dados): SeguradoraSeguro
    {
        $seguradoraSeguro = SeguradoraSeguro::findOrFail($id);

        $seguradoraSeguro->update([
            'premio_minimo' => $dados['premio_minimo'] ?? $seguradoraSeguro->premio_minimo,
            'valor_minimo_dano' => $dados['valor_minimo_dano'] ?? $seguradoraSeguro->valor_minimo_dano,
            'status' => $dados['status'] ?? $seguradoraSeguro->status,
        ]);

        return $seguradoraSeguro->fresh(['seguro', 'seguradora']);
    }

    /**
     * Adicionar novo preço para um seguro
     */
    public function adicionarPreco(int $id_seguradora_seguro, array $dados): Preco
    {
        // Fechar preços anteriores sem data fim
        Preco::where('id_seguradora_seguro', $id_seguradora_seguro)
            ->whereNull('data_fim')
            ->update(['data_fim' => now()->subDay()]);

        return Preco::create([
            'id_seguradora_seguro' => $id_seguradora_seguro,
            'valor' => $dados['valor'],
            'premio_percentagem' => $dados['premio_percentagem'] ?? null,
            'premio_valor' => $dados['premio_valor'] ?? null,
            'usaValor' => $dados['usaValor'] ?? false,
            'data_inicio' => $dados['data_inicio'] ?? now(),
            'data_fim' => $dados['data_fim'] ?? null,
        ]);
    }

    /**
     * Adicionar cobertura para um seguro
     */
    public function adicionarCobertura(int $id_seguradora_seguro, array $dados): DetalhesCobertura
    {
        return DetalhesCobertura::create([
            'id_seguro_seguradora' => $id_seguradora_seguro,
            'descricao' => $dados['descricao'],
            'franquia' => $dados['franquia'] ?? null,
            'valor_minimo' => $dados['valor_minimo'] ?? null,
        ]);
    }

    /**
     * Listar seguros de uma seguradora
     */
    public function listarSegurosSeguradora(int $id_seguradora, array $filtros = [])
    {
        $query = SeguradoraSeguro::with(['seguro.categoria', 'precoAtual', 'coberturas'])
            ->where('id_seguradora', $id_seguradora);

        if (isset($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        if (isset($filtros['tipo_seguro'])) {
            $query->whereHas('seguro', function ($q) use ($filtros) {
                $q->where('tipo_seguro', $filtros['tipo_seguro']);
            });
        }

        if (isset($filtros['id_categoria'])) {
            $query->whereHas('seguro', function ($q) use ($filtros) {
                $q->where('id_categoria', $filtros['id_categoria']);
            });
        }

        return $query->paginate($filtros['per_page'] ?? 15);
    }

    /**
     * Obter detalhes completos de um seguro
     */
    public function obterDetalhesSeguro(int $id_seguradora_seguro)
    {
        return SeguradoraSeguro::with([
            'seguro.categoria',
            'seguradora',
            'precoAtual',
            'precos' => function ($query) {
                $query->orderBy('data_inicio', 'desc');
            },
            'coberturas',
        ])->findOrFail($id_seguradora_seguro);
    }

    /**
     * Desativar um seguro para uma seguradora
     */
    public function desativarSeguro(int $id_seguradora_seguro): SeguradoraSeguro
    {
        $seguradoraSeguro = SeguradoraSeguro::findOrFail($id_seguradora_seguro);
        $seguradoraSeguro->update(['status' => false]);

        return $seguradoraSeguro;
    }

    /**
     * Ativar um seguro para uma seguradora
     */
    public function ativarSeguro(int $id_seguradora_seguro): SeguradoraSeguro
    {
        $seguradoraSeguro = SeguradoraSeguro::findOrFail($id_seguradora_seguro);
        $seguradoraSeguro->update(['status' => true]);

        return $seguradoraSeguro;
    }

    /**
     * Listar todas as categorias
     */
    public function listarCategorias()
    {
        return Categoria::withCount('seguros')->get();
    }
}
