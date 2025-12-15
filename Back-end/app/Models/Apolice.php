<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Apolice extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'apolices';
    protected $primaryKey = 'id_apolice';

    protected $fillable = [
        'numero_apolice',
        'cliente_id',
        'seguradora_seguro_id',
        'tipo_apolice',
        'bem_segurado_id',
        'bem_segurado_type',
        'agente_id',
        'corretora_id',
        'data_emissao',
        'data_inicio_vigencia',
        'data_fim_vigencia',
        'valor_segurado',
        'premio_total',
        'premio_liquido',
        'numero_parcelas',
        'franquia',
        'status',
        'motivo_cancelamento',
        'data_cancelamento',
        'cancelado_por',
        'data_aprovacao',
        'aprovado_por',
        'observacoes',
        'coberturas_selecionadas',
    ];

    protected $casts = [
        'data_emissao' => 'date',
        'data_inicio_vigencia' => 'date',
        'data_fim_vigencia' => 'date',
        'data_cancelamento' => 'datetime',
        'data_aprovacao' => 'datetime',
        'valor_segurado' => 'decimal:2',
        'premio_total' => 'decimal:2',
        'premio_liquido' => 'decimal:2',
        'franquia' => 'decimal:2',
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

    public function seguradora()
    {
        return $this->hasOneThrough(
            Seguradora::class,
            SeguradoraSeguro::class,
            'id',
            'id_seguradora',
            'seguradora_seguro_id',
            'id_seguradora'
        );
    }

    public function seguro()
    {
        return $this->hasOneThrough(
            Seguro::class,
            SeguradoraSeguro::class,
            'id',
            'id_seguro',
            'seguradora_seguro_id',
            'id_seguro'
        );
    }

    public function agente()
    {
        return $this->belongsTo(Agente::class, 'agente_id', 'id_agente');
    }

    public function corretora()
    {
        return $this->belongsTo(Corretora::class, 'corretora_id', 'id_corretora');
    }

    public function bemSegurado()
    {
        return $this->morphTo('bem_segurado', 'bem_segurado_type', 'bem_segurado_id');
    }

    public function pagamentos()
    {
        return $this->hasMany(Pagamento::class, 'apolice_id', 'id_apolice');
    }

    public function pagamentosPendentes()
    {
        return $this->pagamentos()->where('status', 'pendente');
    }

    public function pagamentosPagos()
    {
        return $this->pagamentos()->where('status', 'pago');
    }

    public function sinistros()
    {
        return $this->hasMany(Sinistro::class, 'apolice_id', 'id_apolice');
    }

    public function aprovador()
    {
        return $this->belongsTo(User::class, 'aprovado_por');
    }

    public function cancelador()
    {
        return $this->belongsTo(User::class, 'cancelado_por');
    }

    // Scopes
    public function scopeAtiva($query)
    {
        return $query->where('status', 'ativa');
    }

    public function scopePendenteAprovacao($query)
    {
        return $query->where('status', 'pendente_aprovacao');
    }

    public function scopeVigente($query)
    {
        return $query->where('status', 'ativa')
                     ->where('data_inicio_vigencia', '<=', now())
                     ->where('data_fim_vigencia', '>=', now());
    }

    public function scopeExpirada($query)
    {
        return $query->where('data_fim_vigencia', '<', now());
    }

    public function scopeProximaRenovacao($query, $dias = 30)
    {
        return $query->where('status', 'ativa')
                     ->whereBetween('data_fim_vigencia', [now(), now()->addDays($dias)]);
    }

    public function scopeDoCliente($query, $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }

    public function scopeDaSeguradora($query, $seguradoraId)
    {
        return $query->whereHas('seguradoraSeguro', function ($q) use ($seguradoraId) {
            $q->where('id_seguradora', $seguradoraId);
        });
    }

    public function scopeDaCorretora($query, $corretoraId)
    {
        return $query->where('corretora_id', $corretoraId);
    }

    // Accessors
    public function getVigenteAttribute()
    {
        return $this->status === 'ativa' &&
               $this->data_inicio_vigencia <= now() &&
               $this->data_fim_vigencia >= now();
    }

    public function getDiasRestantesAttribute()
    {
        if (!$this->vigente) {
            return 0;
        }
        return now()->diffInDays($this->data_fim_vigencia, false);
    }

    public function getValorPagoAttribute()
    {
        return $this->pagamentosPagos()->sum('valor_pago');
    }

    public function getValorPendenteAttribute()
    {
        return $this->premio_total - $this->valor_pago;
    }

    // Methods
    public static function gerarNumeroApolice(): string
    {
        $ano = date('Y');
        $ultimo = static::whereYear('created_at', $ano)->max('id_apolice') ?? 0;
        return sprintf('APL%s%06d', $ano, $ultimo + 1);
    }

    public function aprovar(User $aprovador): bool
    {
        $this->status = 'aprovada';
        $this->data_aprovacao = now();
        $this->aprovado_por = $aprovador->id;
        return $this->save();
    }

    public function ativar(): bool
    {
        if ($this->status !== 'aprovada') {
            return false;
        }
        $this->status = 'ativa';
        return $this->save();
    }

    public function cancelar(User $cancelador, string $motivo): bool
    {
        $this->status = 'cancelada';
        $this->motivo_cancelamento = $motivo;
        $this->data_cancelamento = now();
        $this->cancelado_por = $cancelador->id;
        return $this->save();
    }

    public function suspender(): bool
    {
        $this->status = 'suspensa';
        return $this->save();
    }
}
