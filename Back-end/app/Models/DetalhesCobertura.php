<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalhesCobertura extends Model
{
    protected $table = 'detalhes_cobertura';
    protected $primaryKey = 'id_cobertura';

    protected $fillable = [
        'id_seguro_seguradora',
        'nome',
        'descricao',
        'valor_maximo',
        'franquia'
    ];
}
