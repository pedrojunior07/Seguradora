<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salario extends Model
{
    protected $table = 'salarios';
    protected $primaryKey = 'id_salario';

    protected $fillable = [
        'id_colaborador',
        'valor_base',
        'bonus',
        'desconto',
        'data_referencia'
    ];
}
