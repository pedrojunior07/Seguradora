<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function verify(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Link de verificação inválido ou expirado.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email já verificado.']);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Redireciona para o Frontend com mensagem de sucesso
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        return redirect($frontendUrl . '/login?verified=1');
    }

    /**
     * Resend the email verification notification.
     */
    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Segurança: Não revelar se usuário existe
            return response()->json(['message' => 'Se o endereço de email estiver registado, você receberá um novo link de verificação.']);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Este email já foi verificado.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Link de verificação reenviado!']);
    }
}
