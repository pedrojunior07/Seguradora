<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCliente
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->perfil !== 'cliente') {
            return response()->json(['message' => 'Acesso restrito a clientes'], 403);
        }

        if (!$user->perfil_id || !$user->cliente) {
            return response()->json(['message' => 'Cliente não configurado'], 403);
        }

        $request->merge(['cliente' => $user->cliente]);

        return $next($request);
    }
}
