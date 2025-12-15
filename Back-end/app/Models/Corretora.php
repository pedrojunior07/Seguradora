<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Corretora extends Model
{
    use HasFactory;

    protected $table = 'corretoras';
    protected $primaryKey = 'id_corretora';

    protected $fillable = [
        'nome',
        'nuit',
        'telefone',
        'email',
        'endereco',
        'status',
        'licenca',
        'data_licenca_validade',
    ];

    protected $casts = [
        'status' => 'boolean',
        'data_licenca_validade' => 'date',
    ];

    // Relacionamentos
    public function users()
    {
        return $this->hasMany(User::class, 'perfil_id', 'id_corretora')
                    ->where('perfil', 'corretora');
    }

    public function seguradoras()
    {
        return $this->belongsToMany(Seguradora::class, 'corretora_seguradora', 'id_corretora', 'id_seguradora')
                    ->withPivot('status', 'data_inicio', 'data_fim', 'comissao_percentagem', 'observacoes', 'data_aprovacao', 'aprovado_por')
                    ->withTimestamps();
    }

    public function seguradorasAprovadas()
    {
        return $this->seguradoras()->wherePivot('status', 'aprovada');
    }

    public function seguradorasPendentes()
    {
        return $this->seguradoras()->wherePivot('status', 'pendente');
    }

    public function agentes()
    {
        return $this->belongsToMany(Agente::class, 'agente_corretora', 'id_corretora', 'id_agente')
                    ->withPivot('data_inicio', 'data_fim', 'comissao_angariacao', 'comissao_cobranca', 'status')
                    ->withTimestamps();
    }

    public function agentesAtivos()
    {
        return $this->agentes()->wherePivot('status', true);
    }

    public function segurosSeguradoras()
    {
        return $this->belongsToMany(SeguradoraSeguro::class, 'corretora_seguroseguradora', 'id_corretora', 'id_seguro_seguradora')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    public function apolices()
    {
        return $this->hasMany(Apolice::class, 'corretora_id', 'id_corretora');
    }

    public function propostas()
    {
        return $this->hasMany(Proposta::class, 'corretora_id', 'id_corretora');
    }

    public function comissoes()
    {
        return $this->hasManyThrough(
            Comissao::class,
            CorretoraSeguroSeguradora::class,
            'id_corretora',
            'corretora_seguro_seguradora_id',
            'id_corretora',
            'id'
        );
    }

    // Scopes
    public function scopeAtiva($query)
    {
        return $query->where('status', true);
    }

    public function scopeComLicencaValida($query)
    {
        return $query->where('data_licenca_validade', '>=', now());
    }

    // Accessors
    public function getTotalAgentesAttribute()
    {
        return $this->agentesAtivos()->count();
    }

    public function getTotalSeguradorasAttribute()
    {
        return $this->seguradorasAprovadas()->count();
    }

    public function getLicencaValidaAttribute()
    {
        return $this->data_licenca_validade && $this->data_licenca_validade >= now();
    }
}
