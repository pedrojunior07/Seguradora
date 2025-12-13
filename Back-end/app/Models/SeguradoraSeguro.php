<?php

namespace App\Models;

class SeguradoraSeguro extends Model
{
    protected $table = 'seguradora_seguro';

    protected $fillable = [
        'seguro_id',
        'seguradora_id',
        'premio_minimo',
        'valor_minimo_dano',
        'status'
    ];

    public function seguro()
    {
        return $this->belongsTo(Seguro::class);
    }

    public function seguradora()
    {
        return $this->belongsTo(Seguradora::class);
    }

    public function coberturas()
    {
        return $this->hasMany(DetalhesCobertura::class);
    }

    public function precos()
    {
        return $this->hasMany(Preco::class);
    }
}
