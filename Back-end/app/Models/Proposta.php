<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Proposta extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'propostas';
    protected $primaryKey = 'id_proposta';

    protected $fillable = [
        'numero_proposta',
        'cliente_id',
        'seguradora_seguro_id',
        'tipo_proposta',
        'bem_id',
        'bem_type',
        'corretora_id',
        'agente_id',
        'valor_bem',
        'premio_calculado',
        'parcelas_sugeridas',
        'coberturas_selecionadas',
        'data_inicio_proposta',
        'data_fim_proposta',
        'validade_proposta',
        'status',
        'motivo_rejeicao',
        'apolice_gerada_id',
        'observacoes',
    ];

    protected $casts = [
        'data_inicio_proposta' => 'date',
        'data_fim_proposta' => 'date',
        'validade_proposta' => 'date',
        'valor_bem' => 'decimal:2',
        'premio_calculado' => 'decimal:2',
        'coberturas_selecionadas' => 'array',
    ];

    // Relacionamentos
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id', 'id_cliente');
    }

    public function seguradoraSeguro()
    {
        return $this->belongsTo(SeguradoraSeguro::class, 'seguradora_seguro_id', 'id');
    }

    public function corretora()
    {
        return $this->belongsTo(Corretora::class, 'corretora_id', 'id_corretora');
    }

    public function agente()
    {
        return $this->belongsTo(Agente::class, 'agente_id', 'id_agente');
    }

    public function bem()
    {
        return $this->morphTo('bem', 'bem_type', 'bem_id');
    }

    public function apoliceGerada()
    {
        return $this->belongsTo(Apolice::class, 'apolice_gerada_id', 'id_apolice');
    }

    // Scopes
    public function scopeRascunho($query)
    {
        return $query->where('status', 'rascunho');
    }

    public function scopeEnviada($query)
    {
        return $query->where('status', 'enviada');
    }

    public function scopeAprovada($query)
    {
        return $query->where('status', 'aprovada');
    }

    public function scopeValida($query)
    {
        return $query->where('validade_proposta', '>=', now());
    }

    public function scopeExpirada($query)
    {
        return $query->where('validade_proposta', '<', now())
                     ->where('status', '!=', 'convertida');
    }

    public function scopeDoCliente($query, $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }

    public function scopeDaCorretora($query, $corretoraId)
    {
        return $query->where('corretora_id', $corretoraId);
    }

    // Accessors
    public function getValidaAttribute()
    {
        return $this->validade_proposta >= now() && !in_array($this->status, ['convertida', 'expirada']);
    }

    public function getDiasValidadeAttribute()
    {
        if (!$this->valida) {
            return 0;
        }
        return now()->diffInDays($this->validade_proposta, false);
    }

    // Methods
    public static function gerarNumeroProposta(): string
    {
        $ano = date('Y');
        $ultimo = static::whereYear('created_at', $ano)->max('id_proposta') ?? 0;
        return sprintf('PRP%s%06d', $ano, $ultimo + 1);
    }

    public function enviar(): bool
    {
        if ($this->status !== 'rascunho') {
            return false;
        }
        $this->status = 'enviada';
        return $this->save();
    }

    public function aprovar(): bool
    {
        if (!in_array($this->status, ['enviada', 'em_analise'])) {
            return false;
        }
        $this->status = 'aprovada';
        return $this->save();
    }

    public function rejeitar(string $motivo): bool
    {
        $this->status = 'rejeitada';
        $this->motivo_rejeicao = $motivo;
        return $this->save();
    }

    public function converterEmApolice(Apolice $apolice): bool
    {
        $this->status = 'convertida';
        $this->apolice_gerada_id = $apolice->id_apolice;
        return $this->save();
    }

    public function verificarExpiracao(): bool
    {
        if ($this->validade_proposta < now() && !in_array($this->status, ['convertida', 'expirada'])) {
            $this->status = 'expirada';
            return $this->save();
        }
        return false;
    }
}
