<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoSeguro;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TipoSeguroController extends Controller
{
    /**
     * Listar todos os tipos de seguro
     */
    public function index(): JsonResponse
    {
        $tipos = TipoSeguro::with('categoria')->get();
        return response()->json($tipos);
    }

    /**
     * Criar novo tipo de seguro (Apenas Super Admin)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $validated = $request->validate([
            'id_categoria' => 'required|exists:categorias,id_categoria',
            'descricao' => 'required|string|max:255',
            'status' => 'boolean'
        ]);

        $tipo = TipoSeguro::create($validated);

        return response()->json([
            'message' => 'Tipo de seguro criado com sucesso',
            'data' => $tipo
        ], 201);
    }

    /**
     * Mostrar um tipo específico
     */
    public function show($id): JsonResponse
    {
        $tipo = TipoSeguro::with('categoria')->findOrFail($id);
        return response()->json($tipo);
    }

    /**
     * Atualizar tipo de seguro (Apenas Super Admin)
     */
    public function update(Request $request, $id): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $tipo = TipoSeguro::findOrFail($id);
        
        $validated = $request->validate([
            'id_categoria' => 'exists:categorias,id_categoria',
            'descricao' => 'string|max:255',
            'status' => 'boolean'
        ]);

        $tipo->update($validated);

        return response()->json([
            'message' => 'Tipo de seguro atualizado com sucesso',
            'data' => $tipo
        ]);
    }

    /**
     * Excluir tipo de seguro (Apenas Super Admin)
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $tipo = TipoSeguro::findOrFail($id);
        $tipo->delete();

        return response()->json([
            'message' => 'Tipo de seguro excluído com sucesso'
        ]);
    }
}
