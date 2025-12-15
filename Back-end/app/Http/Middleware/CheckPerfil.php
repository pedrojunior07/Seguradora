<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPerfil
{
    public function handle(Request $request, Closure $next, ...$perfis): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        if (!$user->status) {
            return response()->json(['message' => 'Usuário inativo'], 403);
        }

        if (!in_array($user->perfil, $perfis)) {
            return response()->json([
                'message' => 'Acesso não autorizado para este perfil',
                'perfil_atual' => $user->perfil,
                'perfis_permitidos' => $perfis
            ], 403);
        }

        return $next($request);
    }
}
