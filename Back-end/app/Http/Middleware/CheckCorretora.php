<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCorretora
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->perfil !== 'corretora') {
            return response()->json(['message' => 'Acesso restrito a corretoras'], 403);
        }

        if (!$user->perfil_id || !$user->corretora) {
            return response()->json(['message' => 'Corretora não configurada'], 403);
        }

        $request->merge(['corretora' => $user->corretora]);

        return $next($request);
    }
}
