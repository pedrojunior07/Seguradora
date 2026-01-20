<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VeiculoFoto;
use App\Models\Veiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VeiculoFotoController extends Controller
{
    /**
     * Listar fotos de um veículo
     */
    public function index($veiculoId)
    {
        $fotos = VeiculoFoto::where('id_veiculo', $veiculoId)->get();
        
        // Adicionar URL completa para o frontend
        $fotos->transform(function ($foto) {
            $foto->url = asset('storage/' . $foto->caminho_arquivo);
            return $foto;
        });

        return response()->json($fotos);
    }

    /**
     * Upload de foto com substituição automática (Overwrite)
     */
    public function store(Request $request, $veiculoId)
    {
        $validator = Validator::make($request->all(), [
            'categoria' => 'required|string',
            'foto' => 'required|file|image|max:5120', // Max 5MB
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('Upload validation failed', ['errors' => $validator->errors(), 'inputs' => $request->all()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar se veículo existe (e se pertence ao usuário, idealmente)
        $veiculo = Veiculo::findOrFail($veiculoId);
        // TODO: Validar permissão do usuário aqui se necessário

        $categoria = $request->input('categoria');
        $file = $request->file('foto');

        // Verificar se já existe foto para esta categoria
        $fotoExistente = VeiculoFoto::where('id_veiculo', $veiculoId)
            ->where('categoria', $categoria)
            ->first();

        // Se existe, deletar arquivo antigo
        if ($fotoExistente) {
            if (Storage::disk('public')->exists($fotoExistente->caminho_arquivo)) {
                Storage::disk('public')->delete($fotoExistente->caminho_arquivo);
            }
            // Atualizar registro existente ou deletar para recriar
            // Vamos atualizar para manter o ID se não for crucial, ou recriar.
            // Aqui decidiremos apenas atualizar o caminho.
            $path = $file->store("veiculos/{$veiculoId}/fotos", 'public');
            $fotoExistente->caminho_arquivo = $path;
            $fotoExistente->save();
            $foto = $fotoExistente;
        } else {
            // Criar novo
            $path = $file->store("veiculos/{$veiculoId}/fotos", 'public');
            $foto = VeiculoFoto::create([
                'id_veiculo' => $veiculoId,
                'categoria' => $categoria,
                'caminho_arquivo' => $path,
            ]);
        }

        $foto->url = asset('storage/' . $foto->caminho_arquivo);

        return response()->json([
            'message' => 'Foto enviada com sucesso!',
            'data' => $foto
        ]);
    }

    /**
     * Deletar foto
     */
    public function destroy($veiculoId, $fotoId)
    {
        $foto = VeiculoFoto::where('id_veiculo', $veiculoId)
            ->where('id', $fotoId)
            ->firstOrFail();

        if (Storage::disk('public')->exists($foto->caminho_arquivo)) {
            Storage::disk('public')->delete($foto->caminho_arquivo);
        }

        $foto->delete();

        return response()->json(['message' => 'Foto removida com sucesso.']);
    }
}
