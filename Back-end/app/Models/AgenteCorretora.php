<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgenteCorretora extends Model
{
    protected $table = 'agente_corretora';

    protected $fillable = [
        'id_agente',
        'id_corretora',
        'data_inicio',
        'data_fim'
    ];
}

