<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Seguradora;
use App\Models\Apolice;
use App\Models\Sinistro;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Estatísticas Gerais
        $totalUsuarios = User::count();
        $totalSeguradoras = Seguradora::count();
        $totalApolices = Apolice::count();
        $totalSinistros = Sinistro::count();
        
        // Seguradoras Ativas vs Inativas (exemplo, assumindo campo status)
        $seguradorasAtivas = Seguradora::where('status', true)->count();

        // Últimos usuários registrados
        $ultimosUsuarios = User::latest()->take(5)->get();

        return response()->json([
            'stats' => [
                'total_usuarios' => $totalUsuarios,
                'total_seguradoras' => $totalSeguradoras,
                'seguradoras_ativas' => $seguradorasAtivas,
                'total_apolices' => $totalApolices,
                'total_sinistros' => $totalSinistros,
            ],
            'recent_users' => $ultimosUsuarios
        ]);
    }
}
