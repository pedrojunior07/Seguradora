<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Veiculo;

class VeiculoController extends Controller
{
    public function index() { 
        return Veiculo::with('fotos')->where('id_cliente', auth()->id())->get(); 
    }

    public function store(Request $request) { 
        $dados = $request->all();
        $dados['id_cliente'] = auth()->id(); // Garante que o veículo é do usuário logado

        // Gerar ID temporário ou criação inicial para obter ID?
        // Vamos criar primeiro sem fotos para obter o ID
        $veiculo = Veiculo::create($dados);

        // Processar fotos se existirem
        $this->processarFotos($request, $veiculo);
        
        $veiculo->save(); // Salva as alterações de paths das fotos

        return $veiculo; 
    }

    public function show($id) { 
        return Veiculo::with('fotos')->where('id_cliente', auth()->id())->findOrFail($id); 
    }

    public function update(Request $request, $id) { 
        $veiculo = Veiculo::where('id_cliente', auth()->id())->findOrFail($id); 
        $veiculo->fill($request->except(['foto_pneus', 'foto_vidros', 'foto_cadeiras', 'foto_bagageira', 'foto_eletronicos', 'foto_acessorios', 'foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito']));
        
        $this->processarFotos($request, $veiculo);

        $veiculo->save(); 
        return $veiculo; 
    }

    public function destroy($id) { 
        $veiculo = Veiculo::where('id_cliente', auth()->id())->findOrFail($id);
        $veiculo->delete(); 
        return response()->noContent(); 
    }

    private function processarFotos(Request $request, Veiculo $veiculo)
    {
        $camposFotos = [
            'foto_pneus', 'foto_vidros', 'foto_cadeiras', 
            'foto_bagageira', 'foto_eletronicos', 'foto_acessorios',
            'foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito'
        ];

        foreach ($camposFotos as $campo) {
            if ($request->hasFile($campo)) {
                $path = $request->file($campo)->store("veiculos/{$veiculo->id_veiculo}", 'public');
                $tipo = str_replace('foto_', '', $campo);
                
                $veiculo->fotos()->updateOrCreate(
                    ['tipo' => $tipo],
                    ['caminho' => $path]
                );
            }
        }
    }
}
