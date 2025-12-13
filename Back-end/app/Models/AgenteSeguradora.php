<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgenteSeguradora extends Model
{
    protected $table = 'agente_seguradora';

    protected $fillable = [
        'id_agente',
        'id_seguradora',
        'status'
    ];
}

