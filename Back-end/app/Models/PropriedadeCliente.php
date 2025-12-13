<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropriedadeCliente extends Model
{
    protected $table = 'propriedade_cliente';

    protected $fillable = [
        'cliente_id',
        'descricao',
        'valor_estimado'
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function seguros()
    {
        return $this->hasMany(PropriedadeSeguroSeguradora::class);
    }
}

