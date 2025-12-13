<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BemPenhora extends Model
{
    protected $table = 'bem_penhora';
    protected $primaryKey = 'id_penhora';

    protected $fillable = [
        'id_prop_seguroseguradora',
        'tipo_bem',
        'descricao',
        'estado_bom',
        'em_uso',
        'id_cat',
        'valor'
    ];
}
