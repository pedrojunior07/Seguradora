<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Seguradora;
use Illuminate\Http\Request;

class SeguradoraController extends Controller
{
    public function index()
    {
        $seguradoras = Seguradora::with(['users', 'detalhesBancarios'])->paginate(10);
        return response()->json($seguradoras);
    }

    public function store(Request $request)
    {
        // Validação e criação de seguradora (se necessário pelo admin)
        // Por enquanto, placeholder ou implementação básica
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'nif' => 'required|string|unique:seguradoras',
            'email' => 'required|email|unique:users',
            // Outros campos
        ]);

        // Lógica de criação...
    }

    public function update(Request $request, $id)
    {
        $seguradora = Seguradora::findOrFail($id);
        
        // Atualizar status ou dados
        if ($request->has('status')) {
            $seguradora->status = $request->boolean('status');
        }
        
        $seguradora->update($request->except(['status'])); // update outros campos se houver
        $seguradora->save(); // save status

        return response()->json($seguradora);
    }

    public function destroy($id)
    {
        $seguradora = Seguradora::findOrFail($id);
        $seguradora->delete();
        return response()->json(['message' => 'Seguradora removida com sucesso']);
    }

    /**
     * Alternar status da seguradora (Bloquear/Desbloquear)
     */
    public function toggleStatus($id)
    {
        $seguradora = Seguradora::findOrFail($id);
        $novoStatus = !$seguradora->status;
        
        $seguradora->status = $novoStatus;
        $seguradora->save();

        // Bloqueio de usuários agora é verificado dinamicamente no login (AuthService)

        $status = $seguradora->status ? 'ativada' : 'bloqueada';
        return response()->json([
            'message' => "Seguradora {$status} com sucesso",
            'seguradora' => $seguradora
        ]);
    }

    /**
     * Verificar documentos da seguradora
     */
    public function verificar(Request $request, $id)
    {
        $seguradora = Seguradora::findOrFail($id);
        
        $validated = $request->validate([
            'status_verificacao' => 'required|in:aprovado,rejeitado',
            'motivo_rejeicao' => 'required_if:status_verificacao,rejeitado|string|nullable',
        ]);

        $seguradora->status_verificacao = $validated['status_verificacao'];
        $seguradora->verificado = ($validated['status_verificacao'] === 'aprovado');
        
        if ($validated['status_verificacao'] === 'rejeitado') {
            $seguradora->motivo_rejeicao = $validated['motivo_rejeicao'];
        } else {
            $seguradora->motivo_rejeicao = null;
        }

        $seguradora->save();

        return response()->json([
            'message' => 'Status de verificação atualizado com sucesso',
            'seguradora' => $seguradora
        ]);
    }
}
