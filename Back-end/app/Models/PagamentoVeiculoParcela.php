<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagamentoVeiculoParcela extends Model
{
    protected $table = 'pagamento_veiculo_parcela';

    protected $fillable = [
        'numero_parcela',
        'valor_parcela',
        'pago',
        'data_inicio_pagamento',
        'data_fim_pagamento',
        'id_veiculo_seguro',
        'id_metodo_pagamento'
    ];
}
