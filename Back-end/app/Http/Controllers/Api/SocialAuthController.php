<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        $driver = Socialite::driver('google')->stateless();
        
        // Fix for local SSL issues (cURL error 60)
        if (config('app.env') === 'local') {
            $driver->setHttpClient(new \GuzzleHttp\Client(['verify' => false]));
        }

        return $driver->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback()
    {
        try {
            $driver = Socialite::driver('google')->stateless();
            
            // Fix for local SSL issues (cURL error 60)
            if (config('app.env') === 'local') {
                $driver->setHttpClient(new \GuzzleHttp\Client(['verify' => false]));
            }

            $googleUser = $driver->user();
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=Google auth failed: ' . $e->getMessage());
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // User exists, log them in
            if (!$user->status) {
                 return redirect(env('FRONTEND_URL') . '/login?error=Conta inativa');
            }
        } else {
            // User doesn't exist, create a new Cliente account
            // We wrap in transaction ideally, but simple create here works for now
            
            // 1. Create Cliente entity
            $cliente = Cliente::create([
                'tipo_cliente' => 'fisica', // Default
                'nome' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'nuit' => 'PENDING_' . Str::random(8), // Placeholder, user needs to update profile
                'telefone1' => 'PENDING', // Placeholder
                'status' => true,
            ]);

            // 2. Create User
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(Str::random(16)), // Random password
                'perfil' => 'cliente',
                'perfil_id' => $cliente->id_cliente,
                'status' => true,
                'email_verified_at' => now(), // Auto-verify email from Google
                'role' => 'user', // Basic role
            ]);
            
            // Assign avatar if supported (optional)
        }

        // Generate Token
        $token = auth('api')->login($user);

        // Redirect to Frontend with Token
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        
        return redirect("{$frontendUrl}/social-callback?token={$token}&type=bearer");
    }
}
