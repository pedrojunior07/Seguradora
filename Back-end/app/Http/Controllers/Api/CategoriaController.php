<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoriaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/categorias",
     *     summary="Listar todas as categorias",
     *     description="Retorna a lista de todas as categorias de seguros cadastradas no sistema",
     *     tags={"Categorias"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de categorias",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id_categoria", type="integer", example=1),
     *                 @OA\Property(property="descricao", type="string", example="Automóvel"),
     *                 @OA\Property(property="seguros_count", type="integer", example=5, description="Quantidade de seguros nesta categoria")
     *             )
     *         )
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $categorias = Categoria::withCount('seguros')->get();
        return response()->json($categorias);
    }

    /**
     * @OA\Post(
     *     path="/api/categorias",
     *     summary="Criar nova categoria",
     *     description="Cadastra uma nova categoria de seguro no sistema",
     *     tags={"Categorias"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"descricao"},
     *             @OA\Property(property="descricao", type="string", example="Seguro de Vida", description="Nome da categoria (deve ser único)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Categoria criada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Categoria criada com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id_categoria", type="integer", example=1),
     *                 @OA\Property(property="descricao", type="string", example="Seguro de Vida")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erro de validação - categoria já existe"
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'descricao' => 'required|string|max:255|unique:categorias,descricao'
        ]);

        $categoria = Categoria::create($validated);

        return response()->json([
            'message' => 'Categoria criada com sucesso',
            'data' => $categoria
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $categoria = Categoria::findOrFail($id);
        
        $validated = $request->validate([
            'descricao' => 'required|string|max:255|unique:categorias,descricao,' . $id . ',id_categoria'
        ]);

        $categoria->update($validated);

        return response()->json([
            'message' => 'Categoria atualizada com sucesso',
            'data' => $categoria
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $categoria = Categoria::findOrFail($id);

        if ($categoria->seguros()->exists()) {
            return response()->json([
                'message' => 'Não é possível excluir esta categoria pois existem seguros associados a ela.'
            ], 400);
        }

        $categoria->delete();

        return response()->json([
            'message' => 'Categoria excluída com sucesso'
        ]);
    }
}
