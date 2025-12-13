<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaPropriedade extends Model
{
    protected $table = 'cat_propriedade';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nome',
        'descricao'
    ];
}
