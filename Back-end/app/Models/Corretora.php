<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Corretora extends Model
{
    protected $table = 'corretoras';
    protected $primaryKey = 'id_corretora';

    protected $fillable = [
        'nome',
        'nuit',
        'telefone',
        'email',
        'endereco'
    ];
}


