<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar operadores da mesma entidade do admin
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Garante que só lista usuários da mesma entidade (seguradora ou corretora)
        // e que não lista a si mesmo se não quiser (opcional)
        $query = User::where('perfil', $user->perfil)
                    ->where('perfil_id', $user->perfil_id)
                    ->where('role', 'operador'); // Lista apenas operadores? Ou todos da equipe?
                    // Vou listar todos exceto o próprio user, ou todos para exibir na tabela

        // Se quiser listar TODOS da equipe (incluindo outros admins se houver futuramente)
        // mas o requisito é "Gerir Operadores".
        // Vamos listar todos os usuários vinculados à mesma entidade.

        return $query->paginate(15);
    }

    /**
     * Criar novo operador vinculado à entidade do admin
     */
    public function storeOperador(Request $request)
    {
        $admin = $request->user();

        // Validação básica de segurança: Apenas Super Admin pode criar
        if (!$admin->isSuperAdmin()) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6', // Senha inicial definida pelo admin
            'telefone' => 'nullable|string|max:20',
        ]);

        $operador = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'perfil' => $admin->perfil, // Herda perfil (seguradora/corretora)
            'perfil_id' => $admin->perfil_id, // Herda ID da entidade
            'seguradora_id' => $admin->seguradora_id, // Herda seguradora_id se existir
            'role' => 'operador', // Define como Operador
            'status' => true,
            'telefone' => $validated['telefone'] ?? null,
        ]);

        return response()->json([
            'message' => 'Operador criado com sucesso!',
            'user' => $operador
        ], 201);
    }

    /**
     * Atualizar operador (apenas admin da mesma entidade)
     */
    public function update(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin->isSuperAdmin()) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $operador = User::where('id', $id)
                        ->where('perfil', $admin->perfil)
                        ->where('perfil_id', $admin->perfil_id)
                        ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($operador->id)],
            'password' => 'nullable|string|min:6',
            'status' => 'boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $operador->update($validated);

        return response()->json(['message' => 'Usuário atualizado com sucesso', 'user' => $operador]);
    }

    /**
     * Excluir operador
     */
    public function destroy(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin->isSuperAdmin()) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $operador = User::where('id', $id)
                        ->where('perfil', $admin->perfil)
                        ->where('perfil_id', $admin->perfil_id)
                        ->firstOrFail();

        // Impede excluir a si mesmo
        if ($operador->id === $admin->id) {
             return response()->json(['message' => 'Não pode excluir a si mesmo.'], 400);
        }

        $operador->delete();

        return response()->json(['message' => 'Operador removido com sucesso']);
    }
}
