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
        $seguros = \App\Models\SeguradoraSeguro::where('id_seguradora', $id)
                    ->where('status', true)
                    ->with(['seguro.categoria', 'seguro.tipo', 'seguradora'])
                    ->get();
                    
        return response()->json(['data' => $seguros]);
    }

    /**
     * Listar todos os seguros disponíveis de todas as seguradoras.
     */
    public function todosSeguros()
    {
        $seguros = \App\Models\SeguradoraSeguro::where('status', true)
                    ->with(['seguro.categoria', 'seguro.tipo', 'seguradora'])
                    ->get();
                    
        return response()->json(['data' => $seguros]);
    }
}
