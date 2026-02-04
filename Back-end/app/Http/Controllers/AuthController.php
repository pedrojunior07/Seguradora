<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Registrar novo usuário",
     *     description="Registra um novo usuário no sistema. Os campos obrigatórios variam conforme o perfil selecionado.",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation","perfil"},
     *             @OA\Property(property="name", type="string", example="João Silva", description="Nome do usuário"),
     *             @OA\Property(property="email", type="string", format="email", example="joao@example.com", description="Email do usuário (deve ser único)"),
     *             @OA\Property(property="password", type="string", format="password", example="senha12345", description="Senha (mínimo 8 caracteres)"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="senha12345", description="Confirmação da senha"),
     *             @OA\Property(property="perfil", type="string", enum={"cliente","seguradora","corretora"}, example="cliente", description="Tipo de perfil do usuário"),
     *             @OA\Property(property="telefone", type="string", example="+258 84 123 4567", description="Telefone (opcional para seguradora/corretora)"),
     *             @OA\Property(property="tipo_cliente", type="string", enum={"fisica","juridica"}, example="fisica", description="Tipo de cliente (obrigatório se perfil=cliente)"),
     *             @OA\Property(property="nome_completo", type="string", example="João Alberto Silva", description="Nome completo (obrigatório se perfil=cliente)"),
     *             @OA\Property(property="nuit", type="string", example="123456789", description="NUIT - número único de identificação tributária (obrigatório para todos os perfis)"),
     *             @OA\Property(property="documento", type="string", example="BI123456", description="Número do documento (opcional, para cliente)"),
     *             @OA\Property(property="endereco", type="string", example="Av. Julius Nyerere, 123", description="Endereço (opcional)"),
     *             @OA\Property(property="telefone1", type="string", example="+258 84 123 4567", description="Telefone principal (obrigatório se perfil=cliente)"),
     *             @OA\Property(property="telefone2", type="string", example="+258 82 987 6543", description="Telefone secundário (opcional, para cliente)"),
     *             @OA\Property(property="nome_empresa", type="string", example="Seguros TM Lda", description="Nome da empresa (obrigatório se perfil=seguradora ou corretora)"),
     *             @OA\Property(property="licenca", type="string", example="LIC2024001", description="Número da licença (opcional, para corretora)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Registro realizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Registro realizado com sucesso"),
     *             @OA\Property(property="user", type="object"),
     *             @OA\Property(property="entidade", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erro ao registrar (validação falhou)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The name field is required. (and 5 more errors)"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function register(RegisterRequest $request)
    {
        try {
            $validated = $request->validated();

            if ($request->hasFile('logo')) {
                $validated['logo'] = $request->file('logo')->store('seguradoras/logos', 'public');
            }

            // Uploads para Clientes Empresas
            $clientUploads = [
                'upload_nuit', 
                'upload_doc_representante', 
                'upload_certidao_comercial', 
                'upload_licenca', 
                'upload_br'
            ];

            foreach ($clientUploads as $field) {
                if ($request->hasFile($field)) {
                    $validated[$field] = $request->file($field)->store('clientes/docs', 'public');
                }
            }

            $resultado = $this->authService->registrar($validated);

            return response()->json([
                'message' => 'Registro realizado com sucesso. Verifique seu email para ativar a conta.',
                'user' => $resultado['user'],
                'entidade' => $resultado['entidade'],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Registro falhou', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Erro ao registrar: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Fazer login",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="joao@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="senha123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login realizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="access_token", type="string"),
     *             @OA\Property(property="token_type", type="string", example="bearer"),
     *             @OA\Property(property="expires_in", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciais inválidas"
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/me",
     *     summary="Obter dados do usuário autenticado",
     *     tags={"Autenticação"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Dados do usuário",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", type="object"),
     *             @OA\Property(property="entidade", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autenticado"
     *     )
     * )
     */
    public function me(Request $request)
    {
        $user = $request->user()->load($request->user()->perfil);

        return response()->json([
            'user' => $user,
            'entidade' => $user->getPerfilEntidade(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Fazer logout",
     *     tags={"Autenticação"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout realizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Logout realizado com sucesso")
     *         )
     *     )
     * )
     */
    public function logout(Request $request)
    {
        auth()->logout();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/refresh",
     *     summary="Renovar token de acesso",
     *     tags={"Autenticação"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token renovado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="access_token", type="string"),
     *             @OA\Property(property="token_type", type="string", example="bearer"),
     *             @OA\Property(property="expires_in", type="integer")
     *         )
     *     )
     * )
     */
    public function refresh()
    {
        return response()->json([
            'access_token' => auth('api')->refresh(),
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }
}
