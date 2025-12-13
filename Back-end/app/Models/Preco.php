<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Preco extends Model
{
    protected $fillable = [
        'seguradora_seguro_id',
        'valor',
        'premio_percentagem',
        'premio_valor',
        'usa_valor',
        'data_inicio',
        'data_fim'
    ];

    public function seguradoraSeguro()
    {
        return $this->belongsTo(SeguradoraSeguro::class);
    }
}

