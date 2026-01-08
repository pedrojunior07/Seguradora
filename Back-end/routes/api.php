<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SeguroController;
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

// Conteúdo Público (Seguradoras e Seguros)
Route::get('public/seguradoras', [\App\Http\Controllers\Api\SeguradoraController::class, 'index']);
Route::get('public/seguradoras/{id}/seguros', [\App\Http\Controllers\Api\SeguradoraController::class, 'seguros']);
Route::get('public/seguros', [\App\Http\Controllers\Api\SeguradoraController::class, 'todosSeguros']);

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

    // Categorias
    // Categorias e Tipos
    Route::apiResource('categorias', \App\Http\Controllers\Api\CategoriaController::class);
    Route::apiResource('tipos-seguro', \App\Http\Controllers\Api\TipoSeguroController::class);

    // Gestão de Equipe (Super Admin)
    Route::get('equipe', [\App\Http\Controllers\Api\UserController::class, 'index']);
    Route::post('equipe/operadores', [\App\Http\Controllers\Api\UserController::class, 'storeOperador']);
    Route::put('equipe/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
    Route::delete('equipe/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy']);

    // ROTAS SEGURADORA
    Route::prefix('seguradora')->group(function () {
        // Dashboard
        Route::get('dashboard/resumo', [\App\Http\Controllers\DashboardController::class, 'resumo']);
        Route::get('dashboard/grafico-vendas', [\App\Http\Controllers\DashboardController::class, 'graficoVendas']);

        // Seguros
        Route::get('seguros', [SeguroController::class, 'index']);
        Route::post('seguros', [SeguroController::class, 'store']);
        Route::get('seguros/{id}', [SeguroController::class, 'show']);
        Route::put('seguros/{id}', [SeguroController::class, 'update']);
        Route::post('seguros/{id}/ativar', [SeguroController::class, 'ativar']);
        Route::post('seguros/{id}/desativar', [SeguroController::class, 'desativar']);
        Route::post('seguros/{id}/precos', [SeguroController::class, 'adicionarPreco']);
        Route::post('precos/{preco}/ativar', [SeguroController::class, 'ativarPreco']);
        Route::post('precos/{preco}/desativar', [SeguroController::class, 'desativarPreco']);
        Route::post('seguros/{id}/coberturas', [SeguroController::class, 'adicionarCobertura']);

        // Apólices
        Route::get('apolices/pendentes', [SeguradoraApoliceController::class, 'pendentes']);
        Route::get('apolices/ativas', [SeguradoraApoliceController::class, 'ativas']);
        Route::get('apolices/{apolice}', [SeguradoraApoliceController::class, 'show']);
        Route::post('apolices/{apolice}/aprovar', [SeguradoraApoliceController::class, 'aprovar']);
        Route::post('apolices/{apolice}/rejeitar', [SeguradoraApoliceController::class, 'rejeitar']);
        Route::get('apolices/estatisticas', [SeguradoraApoliceController::class, 'estadisticas']);
        Route::get('/contratacoes-diretas', [SeguradoraApoliceController::class, 'contratacoesDiretas']);
        Route::post('/contratacoes-diretas/{id}/decidir', [SeguradoraApoliceController::class, 'decidirProposta']);

        // Sinistros
        Route::get('sinistros/pendentes', [SeguradoraSinistroController::class, 'pendentes']);
        Route::get('sinistros/em-analise', [SeguradoraSinistroController::class, 'emAnalise']);
        Route::get('sinistros/{sinistro}', [SeguradoraSinistroController::class, 'show']);
        Route::post('sinistros/{sinistro}/analisar', [SeguradoraSinistroController::class, 'analisar']);
        Route::post('sinistros/{sinistro}/aprovar', [SeguradoraSinistroController::class, 'aprovar']);
        Route::post('sinistros/{sinistro}/negar', [SeguradoraSinistroController::class, 'negar']);
        Route::get('sinistros/estatisticas', [SeguradoraSinistroController::class, 'estatisticas']);
        Route::get('sinistros/estatisticas', [SeguradoraSinistroController::class, 'estatisticas']);

        // Gestão de Clientes
        Route::get('clientes', [\App\Http\Controllers\Seguradora\ClienteController::class, 'index']);
        Route::post('clientes', [\App\Http\Controllers\Seguradora\ClienteController::class, 'store']);
    });

    // ROTAS CORRETORA
    Route::prefix('corretora')->group(function () {
        // Propostas
        Route::get('propostas', [PropostaController::class, 'index']);
        Route::post('propostas', [PropostaController::class, 'store']);
        Route::get('propostas/{proposta}', [PropostaController::class, 'show']);
        Route::post('propostas/{proposta}/enviar', [PropostaController::class, 'enviar']);
        Route::post('propostas/{proposta}/converter-apolice', [PropostaController::class, 'converterEmApolice']);
    });

    // CONTRATAÇÃO
    Route::prefix('contratacao')->group(function () {
        Route::post('simular', [\App\Http\Controllers\Api\ContratacaoController::class, 'simular']);
        Route::post('contratar', [\App\Http\Controllers\Api\ContratacaoController::class, 'contratar']);
    });

    // ROTAS CLIENTE
    Route::prefix('cliente')->group(function () {
        // Bens
        Route::get('veiculos', [\App\Http\Controllers\Api\VeiculoController::class, 'index']);
        Route::post('veiculos', [\App\Http\Controllers\Api\VeiculoController::class, 'store']);
        Route::get('propriedades', [\App\Http\Controllers\Api\PropriedadeController::class, 'index']);

        // Apólices
        Route::get('apolices', [ClienteApoliceController::class, 'index']);
        Route::get('apolices/ativas', [ClienteApoliceController::class, 'ativas']);
        Route::get('apolices/estatisticas', [ClienteApoliceController::class, 'estatisticas']);
        Route::get('apolices/{apolice}', [ClienteApoliceController::class, 'show']);
        Route::get('apolices/{apolice}/pagamentos', [ClienteApoliceController::class, 'pagamentos']);

        // Sinistros
        Route::get('sinistros', [ClienteSinistroController::class, 'index']);
        Route::get('sinistros/estatisticas', [ClienteSinistroController::class, 'estatisticas']);
        Route::post('sinistros', [ClienteSinistroController::class, 'store']);
        Route::get('sinistros/{sinistro}', [ClienteSinistroController::class, 'show']);
        Route::get('sinistros/{sinistro}/acompanhamento', [ClienteSinistroController::class, 'acompanhamento']);

        // Pagamentos
        Route::get('pagamentos', [PagamentoController::class, 'index']);
        Route::get('pagamentos/pendentes', [PagamentoController::class, 'pendentes']);
        Route::get('pagamentos/atrasados', [PagamentoController::class, 'atrasados']);
        Route::get('pagamentos/estatisticas', [PagamentoController::class, 'estatisticas']);
        Route::get('pagamentos/{pagamento}', [PagamentoController::class, 'show']);
        Route::post('pagamentos/{pagamento}/registrar', [PagamentoController::class, 'registrarPagamento']);
    });
});
