<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Preco extends Model
{
    protected $table = 'precos';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'seguradora_seguro_id',
        'valor',
        'premio_percentagem',
        'premio_valor',
        'usa_valor',
        'data_inicio',
        'data_fim'
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'premio_percentagem' => 'decimal:2',
        'premio_valor' => 'decimal:2',
        'usa_valor' => 'boolean',
        'data_inicio' => 'date',
        'data_fim' => 'date',
    ];

    // Relacionamentos
    public function seguradoraSeguro()
    {
        return $this->belongsTo(SeguradoraSeguro::class, 'seguradora_seguro_id', 'id');
    }

    // Scopes

    // Scopes
    public function scopeAtivo($query)
    {
        return $query->where('data_inicio', '<=', now())
                     ->where(function ($q) {
                         $q->whereNull('data_fim')
                           ->orWhere('data_fim', '>=', now());
                     });
    }

    // Accessors
    public function getIsAtivoAttribute()
    {
        $hoje = now();
        return $this->data_inicio <= $hoje &&
               ($this->data_fim === null || $this->data_fim >= $hoje);
    }

    public function getTipoPremioAttribute()
    {
        return $this->usaValor ? 'valor_fixo' : 'percentagem';
    }
}

