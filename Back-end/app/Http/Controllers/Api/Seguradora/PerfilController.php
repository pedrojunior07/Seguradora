<?php

namespace App\Http\Controllers\Api\Seguradora;

use App\Http\Controllers\Controller;
use App\Models\Seguradora;
use App\Models\DetalhesBancarios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class PerfilController extends Controller
{
    /**
     * Obter status de verificação e documentos
     */
    public function getVerificacaoStatus(Request $request)
    {
        $user = $request->user();
        $seguradora = $user->seguradora;

        if (!$seguradora) {
            return response()->json(['message' => 'Seguradora não encontrada'], 404);
        }

        return response()->json([
            'verificado' => $seguradora->verificado,
            'status_verificacao' => $seguradora->status_verificacao,
            'motivo_rejeicao' => $seguradora->motivo_rejeicao,
            'documentos' => [
                'licenca_br' => $seguradora->licenca_br_path ? Storage::url($seguradora->licenca_br_path) : null,
                'nuit_file' => $seguradora->nuit_file_path ? Storage::url($seguradora->nuit_file_path) : null,
                'bank_details_file' => $seguradora->bank_details_file_path ? Storage::url($seguradora->bank_details_file_path) : null,
            ]
        ]);
    }

    /**
     * Upload de documentos para verificação
     */
    public function uploadDocumentos(Request $request)
    {
        $user = $request->user();
        $seguradora = $user->seguradora;

        if (!$seguradora) {
            return response()->json(['message' => 'Seguradora não encontrada'], 404);
        }

        $validated = $request->validate([
            'licenca_br' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
            'nuit_file' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
            'bank_details_file' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
            // Dados bancários em texto
            'nome_banco' => 'nullable|string',
            'numero_conta' => 'nullable|string',
            'titular' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            if ($request->hasFile('licenca_br')) {
                // Remover anterior se existir
                if ($seguradora->licenca_br_path) Storage::delete($seguradora->licenca_br_path);
                $seguradora->licenca_br_path = $request->file('licenca_br')->store('verificacoes/licencas', 'public');
            }

            if ($request->hasFile('nuit_file')) {
                if ($seguradora->nuit_file_path) Storage::delete($seguradora->nuit_file_path);
                $seguradora->nuit_file_path = $request->file('nuit_file')->store('verificacoes/nuits', 'public');
            }

            if ($request->hasFile('bank_details_file')) {
                if ($seguradora->bank_details_file_path) Storage::delete($seguradora->bank_details_file_path);
                $seguradora->bank_details_file_path = $request->file('bank_details_file')->store('verificacoes/bancos', 'public');
            }

            // Atualizar status para pendente se algum arquivo foi enviado
            if ($request->hasFile('licenca_br') || $request->hasFile('nuit_file') || $request->hasFile('bank_details_file')) {
                $seguradora->status_verificacao = 'pendente';
                $seguradora->verificado = false;
                $seguradora->motivo_rejeicao = null;
            }

            $seguradora->save();

            // Salvar dados bancários na tabela separada se fornecidos
            if ($request->filled(['nome_banco', 'numero_conta', 'titular'])) {
                $seguradora->detalhesBancarios()->updateOrCreate(
                    ['principal' => true],
                    [
                        'nome_banco' => $validated['nome_banco'],
                        'numero_conta' => $validated['numero_conta'],
                        'titular' => $validated['titular'],
                        'principal' => true
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Documentos enviados com sucesso. Aguarde a verificação.',
                'seguradora' => $seguradora
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao processar upload: ' . $e->getMessage()], 500);
        }
    }
}
