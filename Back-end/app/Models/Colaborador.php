<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Colaborador extends Model
{
    protected $table = 'colaboradores';
    protected $primaryKey = 'id_colaborador';

    protected $fillable = [
        'id_empresa',
        'nome',
        'cargo',
        'telefone1',
        'telefone2',
        'email',
        'documento',
        'data_admissao',
        'status'
    ];
}

