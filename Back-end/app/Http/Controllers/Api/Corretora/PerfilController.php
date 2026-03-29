<?php

namespace App\Http\Controllers\Api\Corretora;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\DetalhesBancarios;

class PerfilController extends Controller
{
    public function getVerificacaoStatus(Request $request)
    {
        $user = $request->user();
        $corretora = $user->corretora;

        if (!$corretora) {
            return response()->json(['message' => 'Corretora não encontrada.'], 404);
        }

        return response()->json([
            'id_corretora' => $corretora->id_corretora,
            'nome' => $corretora->nome,
            'status_verificacao' => $corretora->status_verificacao,
            'verificado' => $corretora->verificado,
            'motivo_rejeicao' => $corretora->motivo_rejeicao,
            'documentos' => [
                'licenca_br' => $corretora->licenca_br_path ? Storage::url($corretora->licenca_br_path) : null,
                'nuit' => $corretora->nuit_file_path ? Storage::url($corretora->nuit_file_path) : null,
                'bank_details_file' => $corretora->bank_details_file_path ? Storage::url($corretora->bank_details_file_path) : null,
            ]
        ]);
    }

    public function uploadDocumentos(Request $request)
    {
        $user = $request->user();
        $corretora = $user->corretora;

        try {
            $request->validate([
                'licenca_br' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
                'nuit_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
                'bank_details_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
                'nome_banco' => 'required|string',
                'numero_conta' => 'required|string',
                'titular' => 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Falha na validação de documentos da Corretora:', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            throw $e;
        }

        $data = ['status_verificacao' => 'pendente'];

        if ($request->hasFile('licenca_br')) {
            $data['licenca_br_path'] = $request->file('licenca_br')->store('verificacoes/corretoras', 'public');
        }

        if ($request->hasFile('nuit_file')) {
            $data['nuit_file_path'] = $request->file('nuit_file')->store('verificacoes/corretoras', 'public');
        }

        if ($request->hasFile('bank_details_file')) {
            $data['bank_details_file_path'] = $request->file('bank_details_file')->store('verificacoes/corretoras', 'public');
        }

        $corretora->update($data);

        // Salvar ou atualizar detalhes bancários na tabela polimórfica
        $corretora->detalhesBancarios()->updateOrCreate(
            ['principal' => true],
            [
                'nome_banco' => $request->nome_banco,
                'numero_conta' => $request->numero_conta,
                'titular' => $request->titular,
            ]
        );

        return response()->json([
            'message' => 'Documentos enviados com sucesso. Sua conta está em análise.',
            'status_verificacao' => 'pendente'
        ]);
    }
}
