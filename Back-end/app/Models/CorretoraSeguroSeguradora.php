<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorretoraSeguroSeguradora extends Model
{
    protected $table = 'corretora_seguroseguradora';

    protected $fillable = [
        'id_corretora',
        'id_seguro_seguradora',
        'status'
    ];
}

