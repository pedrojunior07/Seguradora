<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeguradoraSeguro extends Model
{
    use HasFactory;

    protected $table = 'seguradora_seguro';

    protected $fillable = [
        'id_seguradora',
        'id_seguro',
        'premio_minimo',
        'valor_minimo_dano',
        'status',
    ];

    protected $casts = [
        'premio_minimo' => 'decimal:2',
        'valor_minimo_dano' => 'decimal:2',
        'status' => 'boolean',
    ];

    // Relacionamentos
    public function seguro()
    {
        return $this->belongsTo(Seguro::class, 'id_seguro', 'id_seguro');
    }

    public function seguradora()
    {
        return $this->belongsTo(Seguradora::class, 'id_seguradora', 'id_seguradora');
    }

    public function coberturas()
    {
        return $this->hasMany(DetalhesCobertura::class, 'id_seguro_seguradora', 'id');
    }

    public function coberturasAtivas()
    {
        return $this->coberturas()->where('ativo', true);
    }

    public function precos()
    {
        return $this->hasMany(Preco::class, 'seguradora_seguro_id', 'id');
    }

    public function precoAtual()
    {
        return $this->hasOne(Preco::class, 'seguradora_seguro_id', 'id')
                    ->where('data_inicio', '<=', now())
                    ->where(function ($query) {
                        $query->whereNull('data_fim')
                              ->orWhere('data_fim', '>=', now());
                    })
                    ->latest('data_inicio');
    }

    public function apolices()
    {
        return $this->hasMany(Apolice::class, 'seguradora_seguro_id', 'id');
    }

    public function propostas()
    {
        return $this->hasMany(Proposta::class, 'seguradora_seguro_id', 'id');
    }

    public function corretoras()
    {
        return $this->belongsToMany(Corretora::class, 'corretora_seguroseguradora', 'id_seguro_seguradora', 'id_corretora')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    public function agentes()
    {
        return $this->belongsToMany(Agente::class, 'agente_seguroseguradora', 'id_seguro_seguradora', 'id_agente')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeAtivo($query)
    {
        return $query->where('status', true);
    }

    public function scopeDaSeguradora($query, $seguradoraId)
    {
        return $query->where('id_seguradora', $seguradoraId);
    }

    // Accessors
    public function getNomeCompletoAttribute()
    {
        return $this->seguradora->nome . ' - ' . $this->seguro->nome;
    }

    public function getTotalApolicesAttribute()
    {
        return $this->apolices()->count();
    }

    public function getTotalCoberturasAttribute()
    {
        return $this->coberturas()->count();
    }
}
