<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\VeiculoController;
use App\Http\Controllers\SeguradoraController;
use App\Http\Controllers\SeguroController;
use App\Http\Controllers\CategoriaController;

/*
|--------------------------------------------------------------------------
| Rotas públicas (SEM JWT)
|--------------------------------------------------------------------------
*/
Route::post('login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Rotas protegidas (COM JWT)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Clientes
    Route::apiResource('clientes', ClienteController::class);

    // Veículos
    Route::apiResource('veiculos', VeiculoController::class);

    // Seguradoras
    Route::apiResource('seguradoras', SeguradoraController::class);

    // Seguros
    Route::apiResource('seguros', SeguroController::class);

    // Categorias
    Route::apiResource('categorias', CategoriaController::class);
});
