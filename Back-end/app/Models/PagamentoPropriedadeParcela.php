<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class PagamentoPropParcela extends Model
{
    protected $table = 'pagamento_prop_parcela';

    protected $fillable = [
        'propriedade_cliente_seguradora_seguro_id',
        'numero_parcela',
        'valor_parcela',
        'pago',
        'data_inicio_pagamento',
        'data_fim_pagamento',
        'metodo_pagamento_id'
    ];

    public function contrato()
    {
        return $this->belongsTo(
            PropriedadeClienteSeguradoraSeguro::class,
            'propriedade_cliente_seguradora_seguro_id'
        );
    }

    public function metodoPagamento()
    {
        return $this->belongsTo(MetodoPagamento::class);
    }
}
