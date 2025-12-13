<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropriedadeSeguroSeguradora extends Model
{
    protected $table = 'propriedade_seguroseguradora';

    protected $fillable = [
        'propriedade_id',
        'seguro_seguradora',
        'status',
        'data_registo',
        'data_inicio',
        'data_fim',
        'premio',
        'observacoes',
        'quant_prestacoes',
        'premio_prestacao'
    ];
}

