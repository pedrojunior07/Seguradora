<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seguradora extends Model
{
    use HasFactory;

    protected $table = 'seguradoras';
    protected $primaryKey = 'id_seguradora';

    protected $fillable = [
        'nome',
        'nome_responsavel',
        'logo',
        'nuit',
        'telefone1',
        'telefone2',
        'email',
        'endereco',
        'licenca',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // Relacionamentos
    public function users()
    {
        return $this->hasMany(User::class, 'seguradora_id', 'id_seguradora');
    }

    public function seguros()
    {
        return $this->belongsToMany(Seguro::class, 'seguradora_seguro', 'id_seguradora', 'id_seguro')
                    ->withPivot('premio_minimo', 'status', 'valor_minimo_dano')
                    ->withTimestamps();
    }

    public function seguradoraSeguros()
    {
        return $this->hasMany(SeguradoraSeguro::class, 'id_seguradora', 'id_seguradora');
    }

    public function agentes()
    {
        return $this->belongsToMany(Agente::class, 'agente_seguradora', 'id_seguradora', 'id_agente')
                    ->withPivot('status', 'comissao_percentagem', 'data_inicio', 'data_fim')
                    ->withTimestamps();
    }

    public function agentesAtivos()
    {
        return $this->agentes()->wherePivot('status', true);
    }

    public function corretoras()
    {
        return $this->belongsToMany(Corretora::class, 'corretora_seguradora', 'id_seguradora', 'id_corretora')
                    ->withPivot('status', 'data_inicio', 'data_fim', 'comissao_percentagem', 'observacoes', 'data_aprovacao', 'aprovado_por')
                    ->withTimestamps();
    }

    public function corretorasAprovadas()
    {
        return $this->corretoras()->wherePivot('status', 'aprovada');
    }

    public function corretorasPendentes()
    {
        return $this->corretoras()->wherePivot('status', 'pendente');
    }

    public function detalhesBancarios()
    {
        return $this->hasMany(DetalhesBancarios::class, 'seguradora_id', 'id_seguradora');
    }

    public function apolices()
    {
        return $this->hasManyThrough(
            Apolice::class,
            SeguradoraSeguro::class,
            'id_seguradora',
            'seguradora_seguro_id',
            'id_seguradora',
            'id'
        );
    }

    public function precos()
    {
        return $this->hasManyThrough(
            Preco::class,
            SeguradoraSeguro::class,
            'id_seguradora',
            'seguradora_seguro_id',
            'id_seguradora',
            'id'
        );
    }

    public function coberturas()
    {
        return $this->hasManyThrough(
            DetalhesCobertura::class,
            SeguradoraSeguro::class,
            'id_seguradora',
            'id_seguro_seguradora',
            'id_seguradora',
            'id'
        );
    }

    // Scopes
    public function scopeAtiva($query)
    {
        return $query->where('status', true);
    }

    public function scopeInativa($query)
    {
        return $query->where('status', false);
    }

    // Accessors
    public function getTotalAgentesAttribute()
    {
        return $this->agentesAtivos()->count();
    }

    public function getTotalCorretorasAttribute()
    {
        return $this->corretorasAprovadas()->count();
    }

    public function getTotalSegurosAttribute()
    {
        return $this->seguradoraSeguros()->where('status', true)->count();
    }
}
