<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comissao extends Model
{
    protected $table = 'comissao';

    protected $fillable = [
        'corretora_seguro_seguradora_id',
        'propriedade_cliente_seguradora_seguro_id',
        'agente_seguroseguradora_id',
        'agente_corretora_seguro_id',
        'base_calculo',
        'percentagem',
        'valor_comissao',
        'estado',
        'data_calculo',
        'data_pagamento',
    ];

    public function corretoraSeguroSeguradora()
    {
        return $this->belongsTo(CorretoraSeguroSeguradora::class);
    }

    public function contrato()
    {
        return $this->belongsTo(
            PropriedadeClienteSeguradoraSeguro::class,
            'propriedade_cliente_seguradora_seguro_id'
        );
    }

    public function agenteSeguroSeguradora()
    {
        return $this->belongsTo(AgenteSeguroSeguradora::class, 'agente_seguroseguradora_id');
    }

    public function agenteCorretoraSeguro()
    {
        return $this->belongsTo(AgenteCorretoraSeguro::class, 'agente_corretora_seguro_id', 'id_agente_corretora_seguro');
    }
}

