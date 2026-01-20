<?php

namespace App\Services;

use App\Models\Apolice;
use App\Models\Sinistro;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Notifications\AppNotification;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Notification;

class SinistroService
{
    public function registrarSinistro(array $dados): Sinistro
    {
        return DB::transaction(function () use ($dados) {
            $apolice = Apolice::findOrFail($dados['apolice_id']);

            // Verificar se apólice está ativa
            if ($apolice->status !== 'ativa') {
                throw new \Exception('A apólice não está ativa');
            }

            // Verificar se está dentro da vigência
            if (!$apolice->vigente) {
                throw new \Exception('A apólice não está vigente');
            }

            $sinistro = Sinistro::create([
                'numero_sinistro' => Sinistro::gerarNumeroSinistro(),
                'apolice_id' => $dados['apolice_id'],
                'cliente_id' => $apolice->cliente_id,
                'data_ocorrencia' => $dados['data_ocorrencia'],
                'data_comunicacao' => now(),
                'local_ocorrencia' => $dados['local_ocorrencia'],
                'descricao_ocorrencia' => $dados['descricao_ocorrencia'],
                'tipo_sinistro' => $dados['tipo_sinistro'],
                'causa_provavel' => $dados['causa_provavel'] ?? null,
                'valor_estimado_dano' => $dados['valor_estimado_dano'] ?? null,
                'envolve_terceiros' => $dados['envolve_terceiros'] ?? false,
                'dados_terceiros' => $dados['dados_terceiros'] ?? null,
                'numero_bo' => $dados['numero_bo'] ?? null,
                'data_bo' => $dados['data_bo'] ?? null,
                'status' => 'aberto',
                'observacoes' => $dados['observacoes'] ?? null,
                'item_segurado_id' => $apolice->bem_segurado_id,
                'item_segurado_type' => $apolice->bem_segurado_type,
            ]);

            // Processar múltiplos arquivos e salvar no campo documentos (JSON)
            if (isset($dados['arquivos']) && is_array($dados['arquivos'])) {
                $docs = [];
                foreach ($dados['arquivos'] as $arquivo) {
                    $path = $arquivo->store('sinistros/' . $sinistro->id_sinistro, 'public');
                    
                    $docs[] = [
                        'caminho' => $path,
                        'tipo' => str_contains($arquivo->getMimeType(), 'image') ? 'imagem' : 'documento',
                        'nome_original' => $arquivo->getClientOriginalName(),
                        'tamanho' => $arquivo->getSize(),
                        'data_upload' => now()->toDateTimeString(),
                    ];
                }
                $sinistro->documentos = $docs;
                $sinistro->save();
            }

            // Notificar a seguradora
            try {
                $seguradora = $apolice->seguradoraSeguro->seguradora;
                $usuariosSeguradora = $seguradora->users;
                
                if ($usuariosSeguradora->isNotEmpty()) {
                    Notification::send($usuariosSeguradora, new AppNotification([
                        'titulo' => 'Novo Sinistro Reportado',
                        'mensagem' => "Um novo sinistro ({$sinistro->numero_sinistro}) foi reportado pelo cliente {$apolice->cliente->nome}.",
                        'tipo' => 'warning',
                        'url_acao' => "/seguradora/sinistros/{$sinistro->id_sinistro}",
                        'id_objeto' => $sinistro->id_sinistro,
                        'tipo_objeto' => 'sinistro'
                    ]));
                }
            } catch (\Exception $e) {
                // Silenciosamente falhar se houver erro na notificação para não bloquear o registro
                \Log::error("Erro ao enviar notificação de sinistro: " . $e->getMessage());
            }

            return $sinistro;
        });
    }

    public function iniciarAnalise(Sinistro $sinistro, User $analista): Sinistro
    {
        $oldState = $sinistro->toArray();
        $sinistro->iniciarAnalise($analista);
        AuditLog::log('analisar', $sinistro, "Análise de sinistro iniciada pelo analista {$analista->name}", $oldState, $sinistro->fresh()->toArray());
        return $sinistro->fresh();
    }

    public function aprovarSinistro(Sinistro $sinistro, float $valorAprovado, ?float $franquia = null, ?User $analista = null): Sinistro
    {
        return DB::transaction(function () use ($sinistro, $valorAprovado, $franquia, $analista) {
            $apolice = $sinistro->apolice;

            // Usar franquia da apólice se não informada
            $franquiaFinal = $franquia ?? $apolice->franquia;

            // Verificar se valor aprovado não excede cobertura
            if ($valorAprovado > $apolice->valor_segurado) {
                throw new \Exception('Valor aprovado excede o valor segurado');
            }

            $oldState = $sinistro->toArray();
            $sinistro->aprovar($valorAprovado, $franquiaFinal, $analista);

            AuditLog::log('aprovar', $sinistro, "Sinistro aprovado com valor de " . number_format($valorAprovado, 2) . " pelo analista " . ($analista ? $analista->name : 'N/A'), $oldState, $sinistro->fresh()->toArray());

            // Atualizar status da apólice
            $apolice->status = 'sinistrada';
            $apolice->save();

            return $sinistro->fresh();
        });
    }

    public function negarSinistro(Sinistro $sinistro, string $motivo, ?User $analista = null): Sinistro
    {
        $oldState = $sinistro->toArray();
        $sinistro->negar($motivo, $analista);
        AuditLog::log('negar', $sinistro, "Sinistro negado pelo analista " . ($analista ? $analista->name : 'N/A') . ". Motivo: {$motivo}", $oldState, $sinistro->fresh()->toArray());
        return $sinistro->fresh();
    }

    public function registrarPagamento(Sinistro $sinistro, string $formaPagamento): Sinistro
    {
        if (!$sinistro->registrarPagamento($formaPagamento)) {
            throw new \Exception('Não foi possível registrar o pagamento');
        }
        return $sinistro->fresh();
    }

    public function adicionarDocumento(Sinistro $sinistro, array $documento): Sinistro
    {
        $documentos = $sinistro->documentos ?? [];
        $documentos[] = [
            'tipo' => $documento['tipo'],
            'nome' => $documento['nome'],
            'caminho' => $documento['caminho'],
            'data_upload' => now()->toDateTimeString(),
        ];
        $sinistro->documentos = $documentos;
        $sinistro->save();

        return $sinistro->fresh();
    }

    public function listarSinistrosPorStatus(string $status, ?int $seguradoraId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Sinistro::query()
            ->with(['apolice.cliente', 'apolice.seguradoraSeguro.seguradora', 'apolice.seguradoraSeguro.seguro.categoria', 'apolice.seguradoraSeguro.seguro.tipo', 'latestAuditLog.user']);

        if ($status === 'finalizado') {
            $query->whereIn('status', ['aprovado', 'negado', 'pago']);
        } else {
            $query->where('status', $status);
        }

        if ($seguradoraId) {
            $query->whereHas('apolice.seguradoraSeguro', function ($q) use ($seguradoraId) {
                $q->where('id_seguradora', $seguradoraId);
            });
        }

        return $query->orderBy('data_comunicacao', 'desc')->get();
    }

    public function estatisticasSinistros(int $seguradoraId): array
    {
        $query = Sinistro::whereHas('apolice.seguradoraSeguro', function ($q) use ($seguradoraId) {
            $q->where('id_seguradora', $seguradoraId);
        });

        return [
            'total' => $query->count(),
            'abertos' => $query->clone()->where('status', 'aberto')->count(),
            'em_analise' => $query->clone()->where('status', 'em_analise')->count(),
            'aprovados' => $query->clone()->where('status', 'aprovado')->count(),
            'negados' => $query->clone()->where('status', 'negado')->count(),
            'pagos' => $query->clone()->where('status', 'pago')->count(),
            'valor_total_pago' => $query->clone()->where('status', 'pago')->sum('valor_indenizacao'),
        ];
    }
}
