<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Frota;
use Illuminate\Http\Request;
use App\Imports\VeiculosImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class FrotaController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'nome_frota' => 'required|string|max:255',
            'descricao' => 'nullable|string',
        ]);

        $frota = Frota::create([
            'cliente_id' => auth()->user()->perfil_id,
            'nome_frota' => $request->nome_frota,
            'descricao' => $request->descricao,
        ]);

        return response()->json([
            'message' => 'Frota criada com sucesso.',
            'data' => $frota,
        ], 201);
    }

    /**
     * Import vehicles from Excel file to a Fleet.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function importVeiculos(Request $request, $id)
    {
        $request->validate([
            'arquivo' => 'required|file|mimes:xlsx,xls,csv',
            'id_seguradora_seguro' => 'nullable|exists:seguradora_seguro,id',
        ]);

        $frota = Frota::findOrFail($id);
        
        // Ensure user owns the fleet
        if ($frota->cliente_id != auth()->user()->perfil_id) {
            return response()->json(['message' => 'Acesso negado à frota.'], 403);
        }

        $import = new VeiculosImport(
            $frota->id, 
            $request->id_seguradora_seguro, 
            auth()->user()->perfil_id
        );

        try {
            Excel::import($import, $request->file('arquivo'));
        } catch (\Exception $e) {
             return response()->json(['message' => 'Erro ao processar arquivo: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Processamento concluído.',
            'sucesso' => $import->successCount,
            'erros' => $import->errors,
        ]);
    }
    
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $frota = Frota::with(['veiculos.apoliceAtiva'])->findOrFail($id);

        if ($frota->cliente_id != auth()->user()->perfil_id) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        return response()->json(['data' => $frota]);
    }
    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nome_frota' => 'required|string|max:255',
            'descricao' => 'nullable|string',
        ]);

        $frota = Frota::findOrFail($id);
        
        if ($frota->cliente_id != auth()->user()->perfil_id) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $frota->update($request->only(['nome_frota', 'descricao']));

        return response()->json([
            'message' => 'Frota atualizada com sucesso.',
            'data' => $frota,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $frota = Frota::findOrFail($id);

        if ($frota->cliente_id != auth()->user()->perfil_id) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        // Os veículos permanecem no sistema, apenas o vínculo com a frota (se houver via pivot) seria afetado se fosse cascade, 
        // mas aqui estamos deletando a frota. A tabela pivot frota_veiculo deve ter onDelete('cascade').
        $frota->delete();

        return response()->json(['message' => 'Frota removida com sucesso.']);
    }

    /**
     * List fleets for the authenticated client.
     */
    public function index()
    {
        $frotas = Frota::where('cliente_id', auth()->user()->perfil_id)
            ->withCount('veiculos')
            ->get();
        return response()->json(['data' => $frotas]);
    }
}
