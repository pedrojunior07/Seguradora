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

// Verificação de Email
Route::get('email/verify/{id}/{hash}', [\App\Http\Controllers\Api\VerificationController::class, 'verify'])->name('verification.verify');
Route::post('email/resend', [\App\Http\Controllers\Api\VerificationController::class, 'resend'])->name('verification.resend');

// Conteúdo Público (Seguradoras e Seguros)
Route::get('public/seguradoras', [\App\Http\Controllers\Api\SeguradoraController::class, 'index']);
Route::get('public/seguradoras/{id}/seguros', [\App\Http\Controllers\Api\SeguradoraController::class, 'seguros']);
Route::get('public/seguros', [\App\Http\Controllers\Api\SeguradoraController::class, 'todosSeguros']);

// Social Auth
Route::get('auth/google', [\App\Http\Controllers\Api\SocialAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [\App\Http\Controllers\Api\SocialAuthController::class, 'handleGoogleCallback']);

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
    
    // Notificações
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);

    // Suporte
    Route::post('/support/send', [\App\Http\Controllers\Api\SupportController::class, 'send']);

    // Categorias
    Route::apiResource('tipos-seguro', \App\Http\Controllers\Api\TipoSeguroController::class);

    // Rotas de Governança (Super Admin do Sistema)
    Route::middleware(['super_admin'])->prefix('governance')->group(function () {
        Route::get('users', [\App\Http\Controllers\Api\GovernanceController::class, 'indexUsers']);
        Route::post('users/{id}/toggle-status', [\App\Http\Controllers\Api\GovernanceController::class, 'toggleUserStatus']);
        Route::get('settings', [\App\Http\Controllers\Api\GovernanceController::class, 'getSettings']);
        Route::post('settings', [\App\Http\Controllers\Api\GovernanceController::class, 'updateSetting']);
        Route::get('audit-logs', [\App\Http\Controllers\Api\GovernanceController::class, 'getAuditLogs']);
    });

    // ROTAS ADMIN (Super Admin)
    Route::prefix('admin')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);
        
        Route::apiResource('seguradoras', \App\Http\Controllers\Admin\SeguradoraController::class);
        Route::post('seguradoras/{id}/toggle-status', [\App\Http\Controllers\Admin\SeguradoraController::class, 'toggleStatus']);
        Route::apiResource('users', \App\Http\Controllers\Admin\UserController::class);
    });

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
        Route::get('auditoria', [\App\Http\Controllers\Api\AuditController::class, 'index']);

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

        // Propostas
        Route::get('propostas', [\App\Http\Controllers\Api\Seguradora\PropostaController::class, 'index']);
        Route::get('propostas/recentes', [\App\Http\Controllers\Api\Seguradora\PropostaController::class, 'recentNotifications']);
        Route::get('propostas/{id}', [\App\Http\Controllers\Api\Seguradora\PropostaController::class, 'show']);
        Route::post('propostas/{id}/aprovar', [\App\Http\Controllers\Api\Seguradora\PropostaController::class, 'aprovar']);
        Route::post('propostas/{id}/rejeitar', [\App\Http\Controllers\Api\Seguradora\PropostaController::class, 'rejeitar']);

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
        Route::get('sinistros', [SeguradoraSinistroController::class, 'index']);
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

        // Gestão de Agentes
        Route::apiResource('agentes', \App\Http\Controllers\Api\AgenteController::class);
    });

    // ROTAS CORRETORA
    Route::prefix('corretora')->group(function () {
        // Propostas
        Route::get('propostas/recentes', [PropostaController::class, 'recentNotifications']);
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
        Route::get('veiculos/{id}', [\App\Http\Controllers\Api\VeiculoController::class, 'show']);
        Route::post('veiculos/{id}', [\App\Http\Controllers\Api\VeiculoController::class, 'update']); // Usando POST para update por causa do FormData/Arquivos se necessário, ou PUT
        Route::delete('veiculos/{id}', [\App\Http\Controllers\Api\VeiculoController::class, 'destroy']);
        Route::get('veiculos/{id}/fotos', [\App\Http\Controllers\Api\VeiculoFotoController::class, 'index']);
        Route::post('veiculos/{id}/fotos', [\App\Http\Controllers\Api\VeiculoFotoController::class, 'store']);
        Route::delete('veiculos/{id}/fotos/{foto}', [\App\Http\Controllers\Api\VeiculoFotoController::class, 'destroy']);
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

        // Propostas
        Route::get('propostas/recentes', [\App\Http\Controllers\Api\PropostaController::class, 'recentNotifications']);
        Route::get('propostas', [\App\Http\Controllers\Api\PropostaController::class, 'index']);
        Route::post('propostas', [\App\Http\Controllers\Api\PropostaController::class, 'store']);
        Route::get('propostas/{id}', [\App\Http\Controllers\Api\PropostaController::class, 'show']);

        // Pagamentos
        Route::get('pagamentos', [PagamentoController::class, 'index']);
        Route::get('pagamentos/pendentes', [PagamentoController::class, 'pendentes']);
        Route::get('pagamentos/atrasados', [PagamentoController::class, 'atrasados']);
        Route::get('pagamentos/estatisticas', [PagamentoController::class, 'estatisticas']);
        Route::get('pagamentos/{pagamento}', [PagamentoController::class, 'show']);
        Route::post('pagamentos/{pagamento}/registrar', [PagamentoController::class, 'registrarPagamento']);
        
        // Simulação de Pagamento
        Route::post('pagamentos/{id}/confirmar-ficticio', [\App\Http\Controllers\Api\PagamentoFicticioController::class, 'confirmarPagamento']);
    });
});
