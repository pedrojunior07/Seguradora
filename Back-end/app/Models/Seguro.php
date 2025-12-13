<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seguro extends Model
{
    protected $table = 'seguros';
    protected $primaryKey = 'id_seguro';

    protected $fillable = [
        'id_categoria',
        'nome',
        'descricao',
        'tipo_seguro',
        'data_criacao',
        'data_atualizacao'
    ];
}
