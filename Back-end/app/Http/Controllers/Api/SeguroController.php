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
     * @OA\Get(
     *     path="/api/seguradora/seguros",
     *     summary="Listar seguros da seguradora",
     *     description="Retorna todos os seguros cadastrados pela seguradora autenticada com opções de filtro",
     *     tags={"Seguradora - Seguros"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filtrar por status (ativo, inativo)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"ativo", "inativo"})
     *     ),
     *     @OA\Parameter(
     *         name="tipo_seguro",
     *         in="query",
     *         description="Filtrar por tipo de seguro (automovel, saude, residencial, vida)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"automovel", "saude", "residencial", "vida"})
     *     ),
     *     @OA\Parameter(
     *         name="id_categoria",
     *         in="query",
     *         description="Filtrar por ID da categoria",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Número de registros por página",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de seguros retornada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="current_page", type="integer", example=1),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id_seguro", type="integer", example=1),
     *                 @OA\Property(property="nome", type="string", example="Seguro Auto Premium"),
     *                 @OA\Property(property="descricao", type="string", example="Cobertura completa para veículos"),
     *                 @OA\Property(property="tipo_seguro", type="string", example="automovel"),
     *                 @OA\Property(property="status", type="string", example="ativo"),
     *                 @OA\Property(property="id_categoria", type="integer", example=1)
     *             )),
     *             @OA\Property(property="total", type="integer", example=50)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autenticado"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao listar seguros"
     *     )
     * )
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
     * @OA\Post(
     *     path="/api/seguradora/seguros",
     *     summary="Criar novo seguro",
     *     description="Cadastra um novo produto de seguro para a seguradora autenticada",
     *     tags={"Seguradora - Seguros"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nome","tipo_seguro","id_categoria"},
     *             @OA\Property(property="nome", type="string", example="Seguro Auto Premium", description="Nome do seguro"),
     *             @OA\Property(property="descricao", type="string", example="Cobertura completa para veículos de passeio", description="Descrição detalhada"),
     *             @OA\Property(property="tipo_seguro", type="string", enum={"automovel","saude","residencial","vida"}, example="automovel", description="Tipo de seguro"),
     *             @OA\Property(property="id_categoria", type="integer", example=1, description="ID da categoria do seguro"),
     *             @OA\Property(property="detalhes", type="object", description="Informações adicionais específicas do tipo de seguro")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Seguro criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Seguro criado com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id_seguro", type="integer", example=1),
     *                 @OA\Property(property="nome", type="string", example="Seguro Auto Premium"),
     *                 @OA\Property(property="status", type="string", example="ativo")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erro de validação"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autenticado"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao criar seguro"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/seguradora/seguros/{id}",
     *     summary="Obter detalhes de um seguro",
     *     description="Retorna informações detalhadas de um seguro específico incluindo preços e coberturas",
     *     tags={"Seguradora - Seguros"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do seguro",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes do seguro",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id_seguro", type="integer", example=1),
     *                 @OA\Property(property="nome", type="string", example="Seguro Auto Premium"),
     *                 @OA\Property(property="descricao", type="string"),
     *                 @OA\Property(property="tipo_seguro", type="string", example="automovel"),
     *                 @OA\Property(property="status", type="string", example="ativo"),
     *                 @OA\Property(property="precos", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="coberturas", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Seguro não encontrado"
     *     )
     * )
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
     * @OA\Post(
     *     path="/api/seguradora/seguros/{id}/precos",
     *     summary="Adicionar preço ao seguro",
     *     description="Adiciona uma nova tabela de preços para um seguro",
     *     tags={"Seguradora - Seguros"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do seguro",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"valor_base","periodicidade"},
     *             @OA\Property(property="valor_base", type="number", format="float", example=1500.00, description="Valor base do prêmio"),
     *             @OA\Property(property="periodicidade", type="string", enum={"mensal","trimestral","semestral","anual"}, example="mensal"),
     *             @OA\Property(property="descricao", type="string", example="Plano básico mensal")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Preço adicionado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Preço adicionado com sucesso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function adicionarPreco(AdicionarPrecoRequest $request, int $id): JsonResponse
    {
        try {
            \Log::info("Adicionar Preço - ID Seguro: {$id}", ['dados' => $request->all()]);
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
