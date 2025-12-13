<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VeiculoSeguradoraSeguro extends Model
{
    protected $table = 'veiculo_seguradora_seguro';

    protected $fillable = [
        'veiculo_id',
        'seguradora_seguro_id',
        'estado',
        'data_associacao'
    ];
}

