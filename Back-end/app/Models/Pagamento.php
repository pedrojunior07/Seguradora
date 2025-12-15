<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pagamento extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pagamentos';
    protected $primaryKey = 'id_pagamento';

    protected $fillable = [
        'numero_pagamento',
        'apolice_id',
        'cliente_id',
        'numero_parcela',
        'total_parcelas',
        'valor_parcela',
        'valor_pago',
        'juros',
        'multa',
        'desconto',
        'data_vencimento',
        'data_pagamento',
        'metodo_pagamento_id',
        'referencia_pagamento',
        'comprovante',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'data_vencimento' => 'date',
        'data_pagamento' => 'date',
        'valor_parcela' => 'decimal:2',
        'valor_pago' => 'decimal:2',
        'juros' => 'decimal:2',
        'multa' => 'decimal:2',
        'desconto' => 'decimal:2',
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

    public function metodoPagamento()
    {
        return $this->belongsTo(MetodoPagamento::class, 'metodo_pagamento_id');
    }

    // Scopes
    public function scopePendente($query)
    {
        return $query->where('status', 'pendente');
    }

    public function scopePago($query)
    {
        return $query->where('status', 'pago');
    }

    public function scopeAtrasado($query)
    {
        return $query->where('status', 'atrasado');
    }

    public function scopeVencido($query)
    {
        return $query->where('status', 'pendente')
                     ->where('data_vencimento', '<', now());
    }

    public function scopeAVencer($query, $dias = 7)
    {
        return $query->where('status', 'pendente')
                     ->whereBetween('data_vencimento', [now(), now()->addDays($dias)]);
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
    public function getValorTotalAttribute()
    {
        return $this->valor_parcela + $this->juros + $this->multa - $this->desconto;
    }

    public function getAtrasadoAttribute()
    {
        return $this->status === 'pendente' && $this->data_vencimento < now();
    }

    public function getDiasAtrasoAttribute()
    {
        if (!$this->atrasado) {
            return 0;
        }
        return $this->data_vencimento->diffInDays(now());
    }

    // Methods
    public static function gerarNumeroPagamento(): string
    {
        $ano = date('Y');
        $mes = date('m');
        $ultimo = static::whereYear('created_at', $ano)
                        ->whereMonth('created_at', $mes)
                        ->max('id_pagamento') ?? 0;
        return sprintf('PAG%s%s%06d', $ano, $mes, $ultimo + 1);
    }

    public function registrarPagamento(
        float $valorPago,
        ?int $metodoPagamentoId = null,
        ?string $referencia = null,
        ?string $comprovante = null
    ): bool {
        $this->status = 'pago';
        $this->valor_pago = $valorPago;
        $this->data_pagamento = now();
        $this->metodo_pagamento_id = $metodoPagamentoId;
        $this->referencia_pagamento = $referencia;
        $this->comprovante = $comprovante;
        return $this->save();
    }

    public function calcularJurosMulta(float $taxaJurosDiaria = 0.033, float $taxaMulta = 2): void
    {
        if (!$this->atrasado) {
            return;
        }

        $diasAtraso = $this->dias_atraso;
        $this->juros = round($this->valor_parcela * ($taxaJurosDiaria / 100) * $diasAtraso, 2);
        $this->multa = round($this->valor_parcela * ($taxaMulta / 100), 2);
        $this->status = 'atrasado';
        $this->save();
    }

    public function estornar(string $motivo): bool
    {
        if ($this->status !== 'pago') {
            return false;
        }
        $this->status = 'estornado';
        $this->observacoes = $motivo;
        return $this->save();
    }
}
