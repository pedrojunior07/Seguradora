<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';

    protected $fillable = [
        'tipo_cliente',
        'nome',
        'nuit',
        'endereco',
        'telefone1',
        'telefone2',
        'documento',
        'email'
    ];
    public function propriedades()
{
    return $this->hasMany(PropriedadeCliente::class);
}
}


