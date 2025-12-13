<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgenteSeguroSeguradora extends Model
{
    protected $table = 'agente_seguroseguradora';

    protected $fillable = [
        'id_agente',
        'id_seguro_seguradora',
        'status'
    ];
}

