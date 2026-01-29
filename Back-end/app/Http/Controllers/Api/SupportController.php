<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SupportController extends Controller
{
    /**
     * Enviar mensagem de suporte.
     */
    public function send(Request $request)
    {
        $request->validate([
            'assunto' => 'required|string|max:255',
            'mensagem' => 'required|string',
        ]);

        try {
            $user = $request->user();
            $data = [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'assunto' => $request->assunto,
                'mensagem' => $request->mensagem,
                'data_envio' => now()->format('d/m/Y H:i:s')
            ];

            // Tenta obter o email de suporte do arquivo .env, senão usa um padrão ou o email do sistema
            $supportEmail = env('SYSTEM_SUPPORT_EMAIL', config('mail.from.address', 'admin@segurostm.com'));

            // Envia o email usando Mailable para melhor formatação
            Mail::to($supportEmail)->send(new \App\Mail\SupportMessage($data));

            return response()->json(['message' => 'Mensagem enviada com sucesso! Entre em contacto com o admin.']);

        } catch (\Exception $e) {
            Log::error('Erro ao enviar mensagem de suporte: ' . $e->getMessage());
            return response()->json(['message' => 'Erro ao enviar mensagem. Tente novamente mais tarde.'], 500);
        }
    }
}
