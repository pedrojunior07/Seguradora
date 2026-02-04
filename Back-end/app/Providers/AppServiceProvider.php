<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191); // <- tamanho padrão para índices

        // Personalizar o envio de email de verificação
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            // Gerar a URL manualmente para garantir compatibilidade com o VerificationController que usa sha1
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            
            // Construir a URL que aponta para o backend (VerificationController@verify)
            // A rota é: api/email/verify/{id}/{hash}
            // O verification.verify normalmente espera parâmetros assinados, mas o controller customizado usa hash manual.
            
            // Recriar URL do backend
            $backendUrl = URL::to("/api/email/verify/{$id}/{$hash}");

            // Adicionar query params extras se necessário (expires, signature) - mas nosso controller ignora signature manual
            // Vamos manter simples pois o controller valida apenas hash manual.
            
            Log::info('Gerando email de verificação', [
                'user_id' => $id,
                'email' => $notifiable->getEmailForVerification(),
                'url_gerada' => $backendUrl
            ]);

            return (new MailMessage)
                ->subject('Verifique seu endereço de email')
                ->line('Por favor, clique no botão abaixo para verificar seu endereço de email.')
                ->action('Verificar Email', $backendUrl)
                ->line('Se você não criou uma conta, nenhuma outra ação é necessária.');
        });
    }
}
