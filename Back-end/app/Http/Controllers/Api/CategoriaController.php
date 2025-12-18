<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::withCount('seguros')->get();
        return response()->json($categorias);
    }

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
