<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Seguradora\ApoliceController as SeguradoraApoliceController;
use App\Http\Controllers\Seguradora\SinistroController as SeguradoraSinistroController;
use App\Http\Controllers\Corretora\PropostaController;
use App\Http\Controllers\Cliente\ApoliceController as ClienteApoliceController;
use App\Http\Controllers\Cliente\SinistroController as ClienteSinistroController;
use App\Http\Controllers\Cliente\PagamentoController;

/*
|--------------------------------------------------------------------------
| Rotas públicas (SEM JWT)
|--------------------------------------------------------------------------
*/
Route::post('register', [AuthController::class, 'register']);
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
    Route::post('refresh', [AuthController::class, 'refresh']);

    // ROTAS SEGURADORA
    Route::middleware('auth.seguradora')->prefix('seguradora')->group(function () {
        // Apólices
        Route::get('apolices/pendentes', [SeguradoraApoliceController::class, 'pendentes']);
        Route::get('apolices/ativas', [SeguradoraApoliceController::class, 'ativas']);
        Route::get('apolices/{apolice}', [SeguradoraApoliceController::class, 'show']);
        Route::post('apolices/{apolice}/aprovar', [SeguradoraApoliceController::class, 'aprovar']);
        Route::post('apolices/{apolice}/rejeitar', [SeguradoraApoliceController::class, 'rejeitar']);
        Route::get('apolices/estatisticas', [SeguradoraApoliceController::class, 'estadisticas']);

        // Sinistros
        Route::get('sinistros/pendentes', [SeguradoraSinistroController::class, 'pendentes']);
        Route::get('sinistros/em-analise', [SeguradoraSinistroController::class, 'emAnalise']);
        Route::get('sinistros/{sinistro}', [SeguradoraSinistroController::class, 'show']);
        Route::post('sinistros/{sinistro}/analisar', [SeguradoraSinistroController::class, 'analisar']);
        Route::post('sinistros/{sinistro}/aprovar', [SeguradoraSinistroController::class, 'aprovar']);
        Route::post('sinistros/{sinistro}/negar', [SeguradoraSinistroController::class, 'negar']);
        Route::get('sinistros/estatisticas', [SeguradoraSinistroController::class, 'estatisticas']);
    });

    // ROTAS CORRETORA
    Route::middleware('auth.corretora')->prefix('corretora')->group(function () {
        // Propostas
        Route::get('propostas', [PropostaController::class, 'index']);
        Route::post('propostas', [PropostaController::class, 'store']);
        Route::get('propostas/{proposta}', [PropostaController::class, 'show']);
        Route::post('propostas/{proposta}/enviar', [PropostaController::class, 'enviar']);
        Route::post('propostas/{proposta}/converter-apolice', [PropostaController::class, 'converterEmApolice']);
    });

    // ROTAS CLIENTE
    Route::middleware('auth.cliente')->prefix('cliente')->group(function () {
        // Apólices
        Route::get('apolices', [ClienteApoliceController::class, 'index']);
        Route::get('apolices/ativas', [ClienteApoliceController::class, 'ativas']);
        Route::get('apolices/{apolice}', [ClienteApoliceController::class, 'show']);
        Route::get('apolices/{apolice}/pagamentos', [ClienteApoliceController::class, 'pagamentos']);
        Route::get('apolices/estatisticas', [ClienteApoliceController::class, 'estatisticas']);

        // Sinistros
        Route::get('sinistros', [ClienteSinistroController::class, 'index']);
        Route::post('sinistros', [ClienteSinistroController::class, 'store']);
        Route::get('sinistros/{sinistro}', [ClienteSinistroController::class, 'show']);
        Route::get('sinistros/{sinistro}/acompanhamento', [ClienteSinistroController::class, 'acompanhamento']);
        Route::get('sinistros/estatisticas', [ClienteSinistroController::class, 'estatisticas']);

        // Pagamentos
        Route::get('pagamentos', [PagamentoController::class, 'index']);
        Route::get('pagamentos/pendentes', [PagamentoController::class, 'pendentes']);
        Route::get('pagamentos/atrasados', [PagamentoController::class, 'atrasados']);
        Route::get('pagamentos/{pagamento}', [PagamentoController::class, 'show']);
        Route::post('pagamentos/{pagamento}/registrar', [PagamentoController::class, 'registrarPagamento']);
        Route::get('pagamentos/estatisticas', [PagamentoController::class, 'estatisticas']);
    });
});
