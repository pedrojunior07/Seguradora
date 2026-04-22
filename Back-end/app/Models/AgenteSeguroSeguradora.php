<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgenteSeguroSeguradora extends Model
{
    protected $table = 'agente_seguroseguradora';

    protected $fillable = [
        'id_agente',
        'id_seguro_seguradora',
        'status',
        'percentagem_comissao_angariacao',
        'percentagem_comissao_cobranca',
        'data_inicio',
        'data_fim'
    ];
}

