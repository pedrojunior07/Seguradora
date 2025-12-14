<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // LOGIN
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (! $token = Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        return $this->respondWithToken($token);
    }

    // USUÁRIO AUTENTICADO
    public function me()
    {
        return response()->json(Auth::user());
    }

    // LOGOUT
    public function logout()
    {
        Auth::logout();

        return response()->json([
            'message' => 'Logout realizado com sucesso'
        ]);
    }

    // FORMATO DO TOKEN
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth()->factory()->getTTL() * 60
        ]);
    }
}
