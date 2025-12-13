<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropClienteSeguradoraSeguro extends Model
{
    protected $table = 'propriedade_cliente_seguradora_seguro';

    protected $fillable = [
        'propriedade_cliente_id',
        'seguradora_seguro_id',
        'status',
        'data_registo',
        'data_inicio',
        'data_fim',
        'premio',
        'observacoes'
    ];

    public function propriedade()
    {
        return $this->belongsTo(PropriedadeCliente::class, 'propriedade_cliente_id');
    }

    public function seguradoraSeguro()
    {
        return $this->belongsTo(SeguradoraSeguro::class);
    }
}
