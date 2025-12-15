<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSeguradora
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->perfil !== 'seguradora') {
            return response()->json(['message' => 'Acesso restrito a seguradoras'], 403);
        }

        if (!$user->perfil_id || !$user->seguradora) {
            return response()->json(['message' => 'Seguradora não configurada'], 403);
        }

        $request->merge(['seguradora' => $user->seguradora]);

        return $next($request);
    }
}
