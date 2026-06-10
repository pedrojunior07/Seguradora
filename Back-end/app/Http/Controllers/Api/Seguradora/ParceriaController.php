<?php

namespace App\Http\Controllers\Api\Seguradora;

use App\Http\Controllers\Controller;
use App\Models\CorretoraSeguradora;
use App\Models\CorretoraSeguroSeguradora;
use App\Models\SeguradoraSeguro;
use Illuminate\Http\Request;

class ParceriaController extends Controller
{
    private function getSeguradora()
    {
        return \App\Models\Seguradora::where('id_seguradora', auth()->user()->perfil_id)->firstOrFail();
    }

    // GET /seguradora/parceiras
    // Lista todas as solicitações de parceria recebidas (filtrável por status)
    public function index(Request $request)
    {
        $seguradora = $this->getSeguradora();

        $query = CorretoraSeguradora::with(['corretora'])
            ->where('id_seguradora', $seguradora->id_seguradora);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $parceiras = $query->orderByRaw("FIELD(status, 'pendente', 'aprovada', 'rejeitada')")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) use ($seguradora) {
                // Conta quantos seguros a corretora já tem autorização
                $p->seguros_autorizados = CorretoraSeguroSeguradora::where('id_corretora', $p->id_corretora)
                    ->whereHas('seguroSeguradora', fn($q) => $q->where('id_seguradora', $seguradora->id_seguradora))
                    ->where('status', true)
                    ->count();
                return $p;
            });

        return response()->json($parceiras);
    }

    // POST /seguradora/parceiras/{id}/aprovar
    // Aprova a solicitação e libera todos os seguros ativos da seguradora para a corretora
    public function aprovar(Request $request, $id)
    {
        $request->validate([
            'comissao_percentagem' => 'nullable|numeric|min:0|max:100',
        ]);

        $seguradora = $this->getSeguradora();

        $parceria = CorretoraSeguradora::where('id_seguradora', $seguradora->id_seguradora)
            ->where('id', $id)
            ->where('status', 'pendente')
            ->firstOrFail();

        $parceria->update([
            'status'               => 'aprovada',
            'data_aprovacao'       => now(),
            'aprovado_por'         => auth()->id(),
            'comissao_percentagem' => $request->comissao_percentagem ?? 0,
            'data_inicio'          => now(),
        ]);

        // Liberar todos os seguros ativos desta seguradora para a corretora
        $seguros = SeguradoraSeguro::where('id_seguradora', $seguradora->id_seguradora)
            ->where('status', true)
            ->pluck('id');

        foreach ($seguros as $seguroId) {
            CorretoraSeguroSeguradora::firstOrCreate([
                'id_corretora'         => $parceria->id_corretora,
                'id_seguro_seguradora' => $seguroId,
            ], ['status' => true]);
        }

        return response()->json([
            'message'          => 'Parceria aprovada! A corretora já pode vender os seus seguros.',
            'seguros_liberados' => $seguros->count(),
            'parceria'         => $parceria->load('corretora'),
        ]);
    }

    // POST /seguradora/parceiras/{id}/rejeitar
    public function rejeitar(Request $request, $id)
    {
        $request->validate([
            'observacoes' => 'nullable|string|max:500',
        ]);

        $seguradora = $this->getSeguradora();

        $parceria = CorretoraSeguradora::where('id_seguradora', $seguradora->id_seguradora)
            ->where('id', $id)
            ->where('status', 'pendente')
            ->firstOrFail();

        $parceria->update([
            'status'      => 'rejeitada',
            'observacoes' => $request->observacoes,
        ]);

        return response()->json([
            'message'  => 'Solicitação rejeitada.',
            'parceria' => $parceria->load('corretora'),
        ]);
    }

    // GET /seguradora/parceiras/{id}/seguros
    // Lista os seguros autorizados para uma corretora parceira
    public function seguros($id)
    {
        $seguradora = $this->getSeguradora();

        $parceria = CorretoraSeguradora::where('id_seguradora', $seguradora->id_seguradora)
            ->where('id', $id)
            ->firstOrFail();

        $seguros = CorretoraSeguroSeguradora::with(['seguroSeguradora.seguro'])
            ->where('id_corretora', $parceria->id_corretora)
            ->whereHas('seguroSeguradora', fn($q) => $q->where('id_seguradora', $seguradora->id_seguradora))
            ->get()
            ->map(function ($item) {
                $ss = $item->seguroSeguradora;
                return [
                    'id'            => $item->id,
                    'id_seguro'     => $ss?->id_seguro,
                    'nome'          => $ss?->seguro?->nome,
                    'descricao'     => $ss?->seguro?->descricao,
                    'premio_minimo' => $ss?->premio_minimo,
                    'status'        => $item->status,
                ];
            });

        return response()->json($seguros);
    }

    // POST /seguradora/parceiras/{id}/revogar
    // Revoga uma parceria aprovada (remove a corretora dos seguros)
    public function revogar(Request $request, $id)
    {
        $seguradora = $this->getSeguradora();

        $parceria = CorretoraSeguradora::where('id_seguradora', $seguradora->id_seguradora)
            ->where('id', $id)
            ->where('status', 'aprovada')
            ->firstOrFail();

        // Desativar todos os seguros desta seguradora para esta corretora
        $seguroIds = SeguradoraSeguro::where('id_seguradora', $seguradora->id_seguradora)->pluck('id');

        CorretoraSeguroSeguradora::where('id_corretora', $parceria->id_corretora)
            ->whereIn('id_seguro_seguradora', $seguroIds)
            ->update(['status' => false]);

        $parceria->update(['status' => 'suspensa', 'data_fim' => now()]);

        return response()->json(['message' => 'Parceria revogada. A corretora não pode mais vender os seus seguros.']);
    }
}
