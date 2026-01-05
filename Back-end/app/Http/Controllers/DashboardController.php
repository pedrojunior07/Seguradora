<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Apolice;
use App\Models\Sinistro;
use App\Models\Seguro;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Retorna o resumo para o Dashboard da Seguradora
     */
    public function resumo()
    {
        // Estatísticas Gerais
        $totalApolicesAtivas = Apolice::ativa()->count();
        $totalSinistrosPendentes = Sinistro::where('status', 'pendente')->count(); // Ajustar status conforme Model
        
        // Calcular Premia (Prémios) do Mês Atual
        $inicioMes = Carbon::now()->startOfMonth();
        $fimMes = Carbon::now()->endOfMonth();
        
        $premioMensal = Apolice::whereBetween('created_at', [$inicioMes, $fimMes])
                               ->sum('premio_total');

        // Novos Contratos (Mês Atual)
        $novosContratos = Apolice::whereBetween('created_at', [$inicioMes, $fimMes])->count();
        
        // Comparação com mês anterior (Simulação simples para demo)
        $mesAnteriorStart = Carbon::now()->subMonth()->startOfMonth();
        $mesAnteriorEnd = Carbon::now()->subMonth()->endOfMonth();
        $contratosMesAnterior = Apolice::whereBetween('created_at', [$mesAnteriorStart, $mesAnteriorEnd])->count();
        
        $changeContratos = 0;
        if ($contratosMesAnterior > 0) {
            $changeContratos = (($novosContratos - $contratosMesAnterior) / $contratosMesAnterior) * 100;
        }

        return response()->json([
            'apolices_ativas' => [
                'value' => $totalApolicesAtivas,
                'change' => 5, // Exemplo estático ou calcular real
            ],
            'sinistros_pendentes' => [
                'value' => $totalSinistrosPendentes,
                'change' => -2,
            ],
            'novos_contratos' => [
                'value' => $novosContratos,
                'change' => round($changeContratos, 1),
            ],
            'premio_mensal' => [
                'value' => $premioMensal,
                'formatted' => 'MZN ' . number_format($premioMensal, 2),
                'change' => 10,
            ]
        ]);
    }

    /**
     * Dados para gráfico de vendas (Ex: últimos 6 meses)
     */
    public function graficoVendas() 
    {
        $dados = Apolice::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as mes'),
            DB::raw('SUM(premio_total) as total_vendas')
        )
        ->where('created_at', '>=', Carbon::now()->subMonths(6))
        ->groupBy('mes')
        ->orderBy('mes')
        ->get();

        return response()->json($dados);
    }
}
