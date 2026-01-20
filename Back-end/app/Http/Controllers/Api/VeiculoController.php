<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Veiculo;

class VeiculoController extends Controller
{
    /**
     * Listar os veículos do cliente autenticado.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user->cliente) {
                 return response()->json(['message' => 'Usuário não é um cliente ou não tem perfil associado.'], 403);
            }

            $veiculos = $user->cliente->veiculos()->with('fotos')->get(); 
            
            return response()->json([
                'data' => $veiculos
            ], 200);
        } catch (\Exception $e) {
            \Log::error("Erro ao listar veículos do cliente: " . $e->getMessage());
            return response()->json(['message' => 'Erro ao buscar veículos.'], 500);
        }
    }

    /**
     * Cadastrar um novo veículo.
     */
    public function store(Request $request)
    {
        // Validação básica, o resto pode ser nullable
        $request->validate([
            'marca' => 'required|string|max:50',
            'modelo' => 'required|string|max:50',
            'ano_fabrico' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'matricula' => 'required|string|unique:veiculos,matricula',
            'valor_estimado' => 'required|numeric|min:0',
        ]);

        try {
            $user = Auth::user();
            if (!$user->cliente) {
                return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
            }

            $dados = $request->except(['foto_pneus', 'foto_vidros', 'foto_cadeiras', 'foto_bagageira', 'foto_eletronicos', 'foto_acessorios', 'foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito']);
            // Garantir defaults
            if (!isset($dados['tipo_veiculo'])) $dados['tipo_veiculo'] = 'ligeiro';

            $veiculo = $user->cliente->veiculos()->create($dados);

            $this->processarFotos($request, $veiculo);

            // Recarregar com fotos
            $veiculo->load('fotos');

            return response()->json($veiculo, 201); // Retornar direto o objeto para compatibilidade com o frontend
        } catch (\Exception $e) {
            \Log::error("Erro ao cadastrar veículo: " . $e->getMessage());
            return response()->json(['message' => 'Erro ao cadastrar veículo: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = Auth::user();
            if (!$user->cliente) return response()->json(['message' => 'Forbidden'], 403);

            $veiculo = $user->cliente->veiculos()->with('fotos')->findOrFail($id);
            return response()->json($veiculo);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Veículo não encontrado.'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            if (!$user->cliente) return response()->json(['message' => 'Forbidden'], 403);

            $veiculo = $user->cliente->veiculos()->findOrFail($id);

            $dados = $request->except(['foto_pneus', 'foto_vidros', 'foto_cadeiras', 'foto_bagageira', 'foto_eletronicos', 'foto_acessorios', 'foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito', '_method']);
            
            $veiculo->update($dados);

            $this->processarFotos($request, $veiculo);

            $veiculo->load('fotos');
            return response()->json($veiculo);
        } catch (\Exception $e) {
            \Log::error("Erro ao atualizar veículo: " . $e->getMessage());
            return response()->json(['message' => 'Erro ao atualizar veículo.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();
            if (!$user->cliente) return response()->json(['message' => 'Forbidden'], 403);

            $veiculo = $user->cliente->veiculos()->findOrFail($id);
            $veiculo->delete();

            return response()->noContent();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao remover veículo.'], 500);
        }
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
