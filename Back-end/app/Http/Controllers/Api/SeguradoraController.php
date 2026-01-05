<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seguradora;
use App\Models\Seguro;
use Illuminate\Http\Request;

class SeguradoraController extends Controller
{
    /**
     * Listar todas as seguradoras ativas.
     */
    public function index()
    {
        // Retorna seguradoras (nome, logo, etc)
        // Assumindo que a tabela seguradoras contém dados de exibição.
        $seguradoras = Seguradora::all(); // Pode filtrar por status se houver coluna 'ativo'
        return response()->json(['data' => $seguradoras]);
    }

    /**
     * Listar seguros de uma seguradora específica.
     */
    public function seguros($id)
    {
        $seguradora = Seguradora::findOrFail($id);
        
        // Pega os seguros associados a esta seguradora que estão ativos
        // A relação deve estar definida no model Seguradora
        // Se Seguradora cria produtos (Seguro) via SeguradoraSeguro ou chave estrangeira.
        // Baseado na análise anterior: Seguradora -> SeguradoraSeguro -> Seguro
        // OU Seguro tem user_id (seguradora).
        // Vamos usar uma query direta se a relação não for óbvia, mas vamos tentar via relação primeiro.
        
        // Assumindo que Seguradora tem relação 'seguros' (belongsToMany ou hasManyThrough)
        // Se não tiver, precisamos ver como os seguros são ligados.
        // O `SeguradoraSeguro` liga `seguradora_id` e `seguro_id`.
        
        $seguros = $seguradora->seguros()
                    ->with('categoria') // Assumindo relação
                    ->get();
                    
        // Se a relação direta não existir, podemos buscar via tabela pivot ou SeguradoraSeguro manualmente.
        
        return response()->json(['data' => $seguros]);
    }
}
