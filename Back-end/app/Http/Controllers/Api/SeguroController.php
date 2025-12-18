<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seguros\CriarSeguroRequest;
use App\Http\Requests\Seguros\AtualizarSeguroRequest;
use App\Http\Requests\Seguros\AdicionarPrecoRequest;
use App\Http\Requests\Seguros\AdicionarCoberturaRequest;
use App\Services\SeguroService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeguroController extends Controller
{
    protected $seguroService;

    public function __construct(SeguroService $seguroService)
    {
        $this->seguroService = $seguroService;
    }

    /**
     * Listar seguros da seguradora autenticada
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $id_seguradora = auth()->user()->perfil_id;

            $filtros = $request->only(['status', 'tipo_seguro', 'id_categoria', 'per_page']);

            $seguros = $this->seguroService->listarSegurosSeguradora($id_seguradora, $filtros);

            return response()->json($seguros, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao listar seguros',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Criar novo seguro
     */
    public function store(CriarSeguroRequest $request): JsonResponse
    {
        try {
            $id_seguradora = auth()->user()->perfil_id;

            $resultado = $this->seguroService->criarSeguro(
                $request->validated(),
                $id_seguradora
            );

            return response()->json([
                'message' => 'Seguro criado com sucesso',
                'data' => $resultado
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar seguro: ' . $e->getMessage(), [
                'id_seguradora' => $id_seguradora ?? 'null',
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao criar seguro',
                'error' => $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine()
            ], 500);
        }
    }

    /**
     * Obter detalhes de um seguro específico
     */
    public function show(int $id): JsonResponse
    {
        try {
            $seguro = $this->seguroService->obterDetalhesSeguro($id);

            return response()->json([
                'data' => $seguro
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Seguro não encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Atualizar informações do seguro
     */
    public function update(AtualizarSeguroRequest $request, int $id): JsonResponse
    {
        try {
            $seguro = $this->seguroService->atualizarSeguro($id, $request->validated());

            return response()->json([
                'message' => 'Seguro atualizado com sucesso',
                'data' => $seguro
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar seguro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ativar seguro
     */
    public function ativar(int $id): JsonResponse
    {
        try {
            $seguro = $this->seguroService->ativarSeguro($id);

            return response()->json([
                'message' => 'Seguro ativado com sucesso',
                'data' => $seguro
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao ativar seguro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desativar seguro
     */
    public function desativar(int $id): JsonResponse
    {
        try {
            $seguro = $this->seguroService->desativarSeguro($id);

            return response()->json([
                'message' => 'Seguro desativado com sucesso',
                'data' => $seguro
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao desativar seguro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adicionar novo preço ao seguro
     */
    public function adicionarPreco(AdicionarPrecoRequest $request, int $id): JsonResponse
    {
        try {
            $preco = $this->seguroService->adicionarPreco($id, $request->validated());

            return response()->json([
                'message' => 'Preço adicionado com sucesso',
                'data' => $preco
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao adicionar preço',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ativar um preço existente
     */
    public function ativarPreco($preco): JsonResponse
    {
        try {
            $precoId = (int) $preco;
            $precoObj = $this->seguroService->ativarPreco($precoId);

            return response()->json([
                'message' => 'Preço ativado com sucesso',
                'data' => $precoObj
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao ativar preço',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desativar um preço existente
     */
    public function desativarPreco($preco): JsonResponse
    {
        try {
            $precoId = (int) $preco;
            $precoObj = $this->seguroService->desativarPreco($precoId);

            return response()->json([
                'message' => 'Preço desativado com sucesso',
                'data' => $precoObj
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao desativar preço',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adicionar cobertura ao seguro
     */
    public function adicionarCobertura(AdicionarCoberturaRequest $request, int $id): JsonResponse
    {
        try {
            $cobertura = $this->seguroService->adicionarCobertura($id, $request->validated());

            return response()->json([
                'message' => 'Cobertura adicionada com sucesso',
                'data' => $cobertura
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao adicionar cobertura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar categorias disponíveis
     */
    public function categorias(): JsonResponse
    {
        try {
            $categorias = $this->seguroService->listarCategorias();

            return response()->json([
                'data' => $categorias
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao listar categorias',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
