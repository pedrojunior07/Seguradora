<?php

namespace App\Http\Controllers\Api\Corretora;

use App\Http\Controllers\Controller;
use App\Models\CorretoraSeguradora;
use App\Models\Seguradora;
use Illuminate\Http\Request;

class ParceriaController extends Controller
{
    private function getCorretora()
    {
        return \App\Models\Corretora::where('id_corretora', auth()->user()->perfil_id)->firstOrFail();
    }

    // GET /corretora/parceiras
    // Lista todas as parcerias da corretora (pendente, aprovada, rejeitada)
    public function index()
    {
        $corretora = $this->getCorretora();

        $parceiras = CorretoraSeguradora::with(['seguradora'])
            ->where('id_corretora', $corretora->id_corretora)
            ->orderByRaw("FIELD(status, 'pendente', 'aprovada', 'rejeitada')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) {
                $p->seguradora->seguros_count = $p->seguradora->seguros()->where('status', true)->count();
                return $p;
            });

        return response()->json($parceiras);
    }

    // GET /corretora/seguradoras-disponiveis
    // Lista seguradoras verificadas com as quais a corretora ainda não tem parceria ativa ou pendente
    public function seguradoras()
    {
        $corretora = $this->getCorretora();

        $idsOcupados = CorretoraSeguradora::where('id_corretora', $corretora->id_corretora)
            ->whereIn('status', ['pendente', 'aprovada'])
            ->pluck('id_seguradora');

        $seguradoras = Seguradora::where('status', true)
            ->where('status_verificacao', 'aprovado')
            ->whereNotIn('id_seguradora', $idsOcupados)
            ->withCount(['seguros as seguros_count' => fn($q) => $q->where('status', true)])
            ->get(['id_seguradora', 'nome', 'email', 'telefone1', 'endereco', 'logo', 'seguros_count']);

        return response()->json($seguradoras);
    }

    // POST /corretora/seguradoras/{id}/solicitar
    // Solicita parceria com uma seguradora
    public function solicitar($id)
    {
        $corretora = $this->getCorretora();

        if (!$corretora->verificado || $corretora->status_verificacao !== 'aprovado') {
            return response()->json(['message' => 'A sua conta precisa estar verificada para solicitar parcerias.'], 403);
        }

        $seguradora = Seguradora::where('id_seguradora', $id)
            ->where('status', true)
            ->where('status_verificacao', 'aprovado')
            ->firstOrFail();

        $existing = CorretoraSeguradora::where('id_corretora', $corretora->id_corretora)
            ->where('id_seguradora', $id)
            ->first();

        if ($existing) {
            if ($existing->status === 'pendente') {
                return response()->json(['message' => 'Já existe uma solicitação pendente para esta seguradora.'], 422);
            }
            if ($existing->status === 'aprovada') {
                return response()->json(['message' => 'Já tem parceria aprovada com esta seguradora.'], 422);
            }
            // Se foi rejeitada, permite reenviar
            $existing->update([
                'status'       => 'pendente',
                'observacoes'  => null,
                'data_aprovacao' => null,
                'aprovado_por' => null,
            ]);
            return response()->json(['message' => 'Solicitação reenviada com sucesso!', 'parceria' => $existing->load('seguradora')]);
        }

        $parceria = CorretoraSeguradora::create([
            'id_corretora'  => $corretora->id_corretora,
            'id_seguradora' => $id,
            'status'        => 'pendente',
        ]);

        return response()->json([
            'message'  => 'Solicitação enviada com sucesso! Aguarde a aprovação da seguradora.',
            'parceria' => $parceria->load('seguradora'),
        ], 201);
    }

    // DELETE /corretora/parceiras/{id}
    // Cancela uma solicitação pendente
    public function cancelar($id)
    {
        $corretora = $this->getCorretora();

        $parceria = CorretoraSeguradora::where('id_corretora', $corretora->id_corretora)
            ->where('id', $id)
            ->where('status', 'pendente')
            ->firstOrFail();

        $parceria->delete();

        return response()->json(['message' => 'Solicitação cancelada.']);
    }
}
