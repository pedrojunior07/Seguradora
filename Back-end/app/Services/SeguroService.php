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
                'id_tipo_seguro' => $dados['id_tipo_seguro'],
            ]);

            // 2. Criar associação seguradora_seguro
            $seguradoraSeguro = SeguradoraSeguro::create([
                'id_seguro' => $seguro->id_seguro,
                'id_seguradora' => $id_seguradora,
                'premio_minimo' => $dados['premio_minimo'],
                'valor_minimo_dano' => $dados['valor_minimo_dano'] ?? null,
                'status' => $dados['status'] ?? true,
                'auto_aprovacao' => $dados['auto_aprovacao'] ?? false,
            ]);

            // 3. Criar preço inicial (se fornecido)
            if (isset($dados['preco'])) {
                Preco::create([
                    'seguradora_seguro_id' => $seguradoraSeguro->id,
                    'valor' => $dados['preco']['valor'] ?? null,
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
                        'nome' => $cobertura['descricao'],
                        'descricao' => $cobertura['descricao'],
                        'franquia' => $cobertura['franquia'] ?? null,
                        'valor_maximo' => $cobertura['valor_minimo'] ?? null,
                    ]);
                }
            }

            return [
                'seguro' => $seguro->load(['categoria', 'tipo']),
                'seguradoraSeguro' => $seguradoraSeguro->load(['precoAtual', 'coberturas']),
            ];
        });
    }

    /**
     * Atualizar um seguro existente e suas configurações de seguradora
     */
    public function atualizarSeguro(int $id_seguradora_seguro, array $dados): SeguradoraSeguro
    {
        return DB::transaction(function () use ($id_seguradora_seguro, $dados) {
            $seguradoraSeguro = SeguradoraSeguro::findOrFail($id_seguradora_seguro);
            $seguro = $seguradoraSeguro->seguro;

            // Atualizar modelo base (Seguro)
            $seguro->update([
                'id_categoria' => $dados['id_categoria'] ?? $seguro->id_categoria,
                'nome' => $dados['nome'] ?? $seguro->nome,
                'descricao' => $dados['descricao'] ?? $seguro->descricao,
                'id_tipo_seguro' => $dados['id_tipo_seguro'] ?? $seguro->id_tipo_seguro,
            ]);

            // Atualizar modelo de relação (SeguradoraSeguro)
            $seguradoraSeguro->update([
                'premio_minimo' => $dados['premio_minimo'] ?? $seguradoraSeguro->premio_minimo,
                'valor_minimo_dano' => $dados['valor_minimo_dano'] ?? $seguradoraSeguro->valor_minimo_dano,
                'status' => $dados['status'] ?? $seguradoraSeguro->status,
                'auto_aprovacao' => $dados['auto_aprovacao'] ?? $seguradoraSeguro->auto_aprovacao,
            ]);

            return $seguradoraSeguro->load(['seguro.categoria', 'seguro.tipo']);
        });
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
            'auto_aprovacao' => $dados['auto_aprovacao'] ?? $seguradoraSeguro->auto_aprovacao,
        ]);

        return $seguradoraSeguro->fresh(['seguro', 'seguradora']);
    }

    /**
     * Adicionar novo preço para um seguro
     */
    public function adicionarPreco(int $id_seguradora_seguro, array $dados): Preco
    {
        // Fechar preços anteriores sem data fim
        Preco::where('seguradora_seguro_id', $id_seguradora_seguro)
            ->whereNull('data_fim')
            ->update(['data_fim' => now()->subDay()]);

        return Preco::create([
            'seguradora_seguro_id' => $id_seguradora_seguro,
            'valor' => $dados['valor'],
            'premio_percentagem' => $dados['premio_percentagem'] ?? null,
            'premio_valor' => $dados['premio_valor'] ?? null,
            'usa_valor' => $dados['usaValor'] ?? false,
            'data_inicio' => $dados['data_inicio'] ?? now(),
            'data_fim' => $dados['data_fim'] ?? null,
        ]);
    }

    /**
     * Ativar um preço existente tornando-o o preço atual
     */
    public function ativarPreco(int $id_preco): Preco
    {
        return DB::transaction(function () use ($id_preco) {
            $preco = Preco::findOrFail($id_preco);

            // Fechar preços atuais sem data_fim
            Preco::where('seguradora_seguro_id', $preco->seguradora_seguro_id)
                ->whereNull('data_fim')
                ->update(['data_fim' => now()->subDay()]);

            // Tornar este preço o atual
            $preco->data_inicio = now();
            $preco->data_fim = null;
            $preco->save();

            return $preco->fresh();
        });
    }

    /**
     * Desativar um preço existente (definir data_fim)
     */
    public function desativarPreco(int $id_preco): Preco
    {
        $preco = Preco::findOrFail($id_preco);
        $preco->data_fim = now();
        $preco->save();
        return $preco->fresh();
    }

    /**
     * Adicionar cobertura para um seguro
     */
    public function adicionarCobertura(int $id_seguro, array $dados): DetalhesCobertura
    {
        // Buscar a relação SeguradoraSeguro pelo seguro_id
        $seguradora_id = auth()->user()->perfil_id;
        $seguradoraSeguro = \App\Models\SeguradoraSeguro::where('id_seguro', $id_seguro)
            ->where('id_seguradora', $seguradora_id)
            ->first();
        if (!$seguradoraSeguro) {
            \Log::error('Não encontrou relação SeguradoraSeguro para adicionar cobertura', [
                'id_seguro' => $id_seguro,
                'id_seguradora' => $seguradora_id
            ]);
            throw new \Exception('Relação entre seguradora e seguro não encontrada. Não foi possível adicionar cobertura.');
        }
        return DetalhesCobertura::create([
            'id_seguro_seguradora' => $seguradoraSeguro->id,
            'nome' => $dados['descricao'],
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
        $query = SeguradoraSeguro::with(['seguro.categoria', 'seguro.tipo', 'precoAtual', 'coberturas'])
            ->where('id_seguradora', $id_seguradora);

        if (isset($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        if (isset($filtros['tipo_seguro'])) {
            $query->whereHas('seguro.tipo', function ($q) use ($filtros) {
                 // Assumindo que o filtro 'tipo_seguro' venha como ID ou String. Se for string, tentamos descricao
                 // Se vier ID, melhor
                 if (is_numeric($filtros['tipo_seguro'])) {
                     $q->where('id', $filtros['tipo_seguro']);
                 } else {
                     $q->where('descricao', 'like', '%' . $filtros['tipo_seguro'] . '%');
                 }
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
            'seguro.tipo',
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
        return Categoria::with('tipos')->withCount('seguros')->get();
    }
}
