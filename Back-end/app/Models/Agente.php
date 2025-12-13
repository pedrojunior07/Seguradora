<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agente extends Model
{
    protected $table = 'agentes';
    protected $primaryKey = 'id_agente';

    protected $fillable = [
        'nome',
        'telefone',
        'email',
        'documento',
        'status'
    ];
}
