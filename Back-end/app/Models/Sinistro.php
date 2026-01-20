<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sinistro extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sinistros';
    protected $primaryKey = 'id_sinistro';

    protected $fillable = [
        'numero_sinistro',
        'apolice_id',
        'cliente_id',
        'data_ocorrencia',
        'data_comunicacao',
        'local_ocorrencia',
        'descricao_ocorrencia',
        'tipo_sinistro',
        'causa_provavel',
        'valor_estimado_dano',
        'valor_aprovado',
        'valor_franquia',
        'valor_indenizacao',
        'status',
        'documentos',
        'parecer_tecnico',
        'envolve_terceiros',
        'dados_terceiros',
        'numero_bo',
        'data_bo',
        'analista_id',
        'data_analise',
        'motivo_negacao',
        'data_pagamento',
        'forma_pagamento',
        'observacoes',
        'item_segurado_id',
        'item_segurado_type',
    ];

    protected $casts = [
        'data_ocorrencia' => 'datetime',
        'data_comunicacao' => 'datetime',
        'data_bo' => 'date',
        'data_analise' => 'datetime',
        'data_pagamento' => 'date',
        'valor_estimado_dano' => 'decimal:2',
        'valor_aprovado' => 'decimal:2',
        'valor_franquia' => 'decimal:2',
        'valor_indenizacao' => 'decimal:2',
        'documentos' => 'array',
        'dados_terceiros' => 'array',
        'envolve_terceiros' => 'boolean',
    ];

    // Relacionamentos
    public function apolice()
    {
        return $this->belongsTo(Apolice::class, 'apolice_id', 'id_apolice');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id', 'id_cliente');
    }

    public function analista()
    {
        return $this->belongsTo(User::class, 'analista_id');
    }

    public function itemSegurado()
    {
        return $this->morphTo('itemSegurado', 'item_segurado_type', 'item_segurado_id');
    }

    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable');
    }

    public function latestAuditLog()
    {
        return $this->morphOne(AuditLog::class, 'auditable')->latestOfMany();
    }

    // Scopes
    public function scopeAberto($query)
    {
        return $query->where('status', 'aberto');
    }

    public function scopeEmAnalise($query)
    {
        return $query->where('status', 'em_analise');
    }

    public function scopeAprovado($query)
    {
        return $query->where('status', 'aprovado');
    }

    public function scopeNegado($query)
    {
        return $query->where('status', 'negado');
    }

    public function scopePago($query)
    {
        return $query->where('status', 'pago');
    }

    public function scopeDoCliente($query, $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }

    public function scopeDaApolice($query, $apoliceId)
    {
        return $query->where('apolice_id', $apoliceId);
    }

    // Accessors
    public function getValorLiquidoIndenizacaoAttribute()
    {
        if (!$this->valor_aprovado) {
            return 0;
        }
        return $this->valor_aprovado - $this->valor_franquia;
    }

    // Methods
    public static function gerarNumeroSinistro(): string
    {
        $ano = date('Y');
        $ultimo = static::whereYear('created_at', $ano)->max('id_sinistro') ?? 0;
        return sprintf('SIN%s%06d', $ano, $ultimo + 1);
    }

    public function iniciarAnalise(User $analista): bool
    {
        $this->status = 'em_analise';
        $this->analista_id = $analista->id;
        $this->data_analise = now();
        return $this->save();
    }

    public function aprovar(float $valorAprovado, float $franquia = 0, ?User $analista = null): bool
    {
        $this->status = 'aprovado';
        if ($analista) {
            $this->analista_id = $analista->id;
            $this->data_analise = now();
        }
        $this->valor_aprovado = $valorAprovado;
        $this->valor_franquia = $franquia;
        $this->valor_indenizacao = $valorAprovado - $franquia;
        return $this->save();
    }

    public function negar(string $motivo, ?User $analista = null): bool
    {
        $this->status = 'negado';
        if ($analista) {
            $this->analista_id = $analista->id;
            $this->data_analise = now();
        }
        $this->motivo_negacao = $motivo;
        return $this->save();
    }

    public function registrarPagamento(string $formaPagamento): bool
    {
        if ($this->status !== 'aprovado') {
            return false;
        }
        $this->status = 'pago';
        $this->data_pagamento = now();
        $this->forma_pagamento = $formaPagamento;
        return $this->save();
    }
}
