<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    public function register(RegisterRequest $request)
    {
        try {
            $resultado = $this->authService->registrar($request->validated());

            return response()->json([
                'message' => 'Registro realizado com sucesso',
                'user' => $resultado['user'],
                'entidade' => $resultado['entidade'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao registrar',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            $resultado = $this->authService->login($request->email, $request->password);

            if (!$resultado) {
                return response()->json([
                    'message' => 'Credenciais inválidas',
                ], 401);
            }

            return response()->json($resultado, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function me(Request $request)
    {
        $user = $request->user()->load($request->user()->perfil);

        return response()->json([
            'user' => $user,
            'entidade' => $user->getPerfilEntidade(),
        ]);
    }

    public function logout(Request $request)
    {
        auth()->logout();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    public function refresh()
    {
        return response()->json([
            'access_token' => auth('api')->refresh(),
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }
}
