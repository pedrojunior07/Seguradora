<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    protected $table = 'empresas';
    protected $primaryKey = 'id_empresa';

    protected $fillable = [
        'nome',
        'nuit',
        'telefone1',
        'telefone2',
        'email',
        'endereco',
        'status'
    ];
}

