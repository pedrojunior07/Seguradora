<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agente;
use App\Models\AgenteSeguroSeguradora;
use App\Models\Seguradora;
use App\Models\SeguradoraSeguro;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AgenteController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Listar agentes da seguradora
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Define seguradora_id from user context
        if ($user->perfil === 'seguradora') {
            $seguradoraId = $user->perfil_id;
        } else {
            // Se for super admin e passar id, ou outra lógica. 
            // Assumindo que essa rota está protegida para seguradora.
             return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agentes = Agente::whereHas('seguradoras', function ($q) use ($seguradoraId) {
            $q->where('agente_seguradora.id_seguradora', $seguradoraId);
        })
        ->with(['user', 'segurosSeguradoras.seguro']) // Eager load user and associated insurances
        ->paginate(15);

        return $agentes;
    }

    /**
     * Criar novo agente
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Determinar ID da seguradora
        $seguradoraId = null;
        if ($user->perfil === 'seguradora') {
            $seguradoraId = $user->perfil_id;
        } else if ($user->isSuperAdmin() && $request->has('seguradora_id')) {
            $seguradoraId = $request->input('seguradora_id');
        }

        if (!$seguradoraId) {
            return response()->json(['message' => 'Seguradora não identificada.'], 400);
        }

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|unique:agentes,email',
            'telefone' => 'required|string|max:20',
            'documento' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6', // Opcional, gera default se vazio
            'comissao_percentagem' => 'nullable|numeric|min:0|max:100',
            'seguros_ids' => 'nullable|array', // IDs dos SeguradoraSeguro
            'seguros_ids.*' => 'exists:seguradora_seguro,id',
        ]);
        
        // Preparar dados para o AuthService
        $dadosAgente = [
            'nome' => $validated['nome'],
            'email' => $validated['email'],
            'telefone' => $validated['telefone'],
            'documento' => $validated['documento'] ?? null,
            'password' => $validated['password'] ?? 'agente123', // Senha padrão se não informada
            'comissao_percentagem' => $validated['comissao_percentagem'] ?? 0,
        ];

        try {
            DB::beginTransaction();

            // Usa AuthService para criar Agente, User e Vínculo com Seguradora
            $resultado = $this->authService->criarAgente($dadosAgente, 'seguradora', $seguradoraId);
            $agente = $resultado['agente'];

            // Associar aos Seguros Específicos (SeguradoraSeguro)
            if (!empty($validated['seguros_ids'])) {
                foreach ($validated['seguros_ids'] as $seguroSeguradoraId) {
                    // Verificar se o seguro pertence à seguradora (segurança)
                    $pertence = SeguradoraSeguro::where('id', $seguroSeguradoraId)
                        ->where('id_seguradora', $seguradoraId)
                        ->exists();

                    if ($pertence) {
                         $agente->segurosSeguradoras()->attach($seguroSeguradoraId, ['status' => true]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Agente criado com sucesso!',
                'agente' => $agente->load('user', 'segurosSeguradoras')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao criar agente: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Atualizar agente
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->perfil !== 'seguradora') {
             return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agente = Agente::where('id_agente', $id)
            ->whereHas('seguradoras', function ($q) use ($user) {
                $q->where('agente_seguradora.id_seguradora', $user->perfil_id);
            })->firstOrFail();

        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('agentes')->ignore($agente->id_agente, 'id_agente')],
            'telefone' => 'nullable|string|max:20',
            'status' => 'boolean',
            'seguros_ids' => 'sometimes|array',
            'seguros_ids.*' => 'exists:seguradora_seguro,id',
        ]);

        try {
            DB::beginTransaction();

            $agente->update($validated);

            // Atualizar User associado se email/nome mudou
            $agenteUser = $agente->user;
            if ($agenteUser) {
                if (isset($validated['nome'])) $agenteUser->name = $validated['nome'];
                if (isset($validated['email'])) $agenteUser->email = $validated['email'];
                if (isset($validated['status'])) $agenteUser->status = $validated['status'];
                $agenteUser->save();
            }

            // Atualizar Seguros Associados
            if (isset($validated['seguros_ids'])) {
                 // Sync garante que apenas os enviados fiquem ativos
                 // Mas precisamos garantir que sejam da seguradora atual
                 $validIds = SeguradoraSeguro::whereIn('id', $validated['seguros_ids'])
                    ->where('id_seguradora', $user->perfil_id)
                    ->pluck('id')
                    ->toArray();
                 
                 // Usando sync com pivot status
                 $agente->segurosSeguradoras()->syncWithPivotValues($validIds, ['status' => true]);
            }

            DB::commit();

             return response()->json([
                'message' => 'Agente atualizado com sucesso!',
                'agente' => $agente->load('user', 'segurosSeguradoras')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao atualizar agente.'], 500);
        }
    }

    /**
     * Remover agente (desativar)
     */
    public function destroy(Request $request, $id)
    {
         $user = $request->user();
        
        if ($user->perfil !== 'seguradora') {
             return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $agente = Agente::where('id_agente', $id)
            ->whereHas('seguradoras', function ($q) use ($user) {
                $q->where('agente_seguradora.id_seguradora', $user->perfil_id);
            })->firstOrFail();

        // Soft delete logic: apenas inativa o status e o user
        $agente->status = false;
        $agente->save();

        if ($agente->user) {
            $agente->user->status = false;
            $agente->user->save();
        }
        
        // Também desativa vinculo na tabela pivot se quiser, ou mantem histórico
        DB::table('agente_seguradora')
            ->where('id_agente', $id)
            ->where('id_seguradora', $user->perfil_id)
            ->update(['status' => false]);

        return response()->json(['message' => 'Agente inativado com sucesso.']);
    }
}
