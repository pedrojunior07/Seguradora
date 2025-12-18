<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="API Seguros TM",
 *     version="1.0.0",
 *     description="API para gestão de seguros, clientes, apólices e sinistros",
 *     @OA\Contact(
 *         email="suporte@segurostm.com"
 *     )
 * )
 * @OA\Server(
 *     url="http://127.0.0.1:8000",
 *     description="Servidor de Desenvolvimento"
 * )
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Autenticação JWT. Use o token retornado no endpoint de login."
 * )
 */
abstract class Controller
{
    //
}
