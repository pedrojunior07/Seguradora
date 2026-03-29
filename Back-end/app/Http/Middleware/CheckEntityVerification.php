<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEntityVerification
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Se for admin do sistema, não precisa de verificação de entidade
        if ($user->isAdmin()) {
            return $next($request);
        }

        $entidade = $user->getPerfilEntidade();

        if ($entidade) {
            // Verifica se a entidade tem o campo status_verificacao
            // (Para Clientes ou outros tipos, podemos pular ou aplicar regras diferentes)
            if ($user->isSeguradora() || $user->isCorretora()) {
                if ($entidade->status_verificacao !== 'aprovado') {
                    return response()->json([
                        'message' => 'Sua conta ainda não foi totalmente verificada pelos administradores do sistema.',
                        'error' => 'ENTITY_NOT_VERIFIED',
                        'status_verificacao' => $entidade->status_verificacao,
                        'motivo_rejeicao' => $entidade->motivo_rejeicao
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
