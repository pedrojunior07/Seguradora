<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Corretora;
use Illuminate\Http\Request;

class CorretoraController extends Controller
{
    public function index(Request $request)
    {
        $query = Corretora::query();

        if ($request->has('search')) {
            $query->where('nome', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status_verificacao')) {
            $query->where('status_verificacao', $request->status_verificacao);
        }

        $corretoras = $query->with('detalhesBancarios')->paginate(15);
        
        // Append current bank details and other info for easy listing
        $corretoras->getCollection()->transform(function ($corretora) {
            $bank = $corretora->detalhesBancarios()->where('principal', true)->first();
            $corretora->banco = $bank ? $bank->nome_banco : null;
            $corretora->numero_conta = $bank ? $bank->numero_conta : null;
            $corretora->titular = $bank ? $bank->titular : null;
            return $corretora;
        });

        return response()->json($corretoras);
    }

    public function show($id)
    {
        $corretora = Corretora::with(['users', 'detalhesBancarios'])->findOrFail($id);
        return response()->json($corretora);
    }

    public function toggleStatus($id)
    {
        $corretora = Corretora::findOrFail($id);
        $corretora->status = !$corretora->status;
        $corretora->save();

        return response()->json([
            'message' => 'Status da corretora atualizado com sucesso.',
            'status' => $corretora->status
        ]);
    }

    public function verificar(Request $request, $id)
    {
        $request->validate([
            'status_verificacao' => 'required|in:aprovado,rejeitado',
            'motivo_rejeicao' => 'required_if:status_verificacao,rejeitado'
        ]);

        $corretora = Corretora::findOrFail($id);
        $corretora->status_verificacao = $request->status_verificacao;
        
        if ($request->status_verificacao === 'aprovado') {
            $corretora->verificado = true;
            $corretora->motivo_rejeicao = null;
        } else {
            $corretora->verificado = false;
            $corretora->motivo_rejeicao = $request->motivo_rejeicao;
        }

        $corretora->save();

        return response()->json([
            'message' => 'Verificação de corretora atualizada com sucesso.',
            'status' => $corretora->status_verificacao
        ]);
    }
}
