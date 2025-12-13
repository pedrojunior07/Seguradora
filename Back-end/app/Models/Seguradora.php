<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Seguradora extends Model
{
    protected $table = 'seguradoras';
    protected $primaryKey = 'id_seguradora';

    protected $fillable = [
        'nome',
        'nuit',
        'telefone1',
        'telefone2',
        'endereco',
        'email'
    ];
}

