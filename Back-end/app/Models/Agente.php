<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agente extends Model
{
    use HasFactory;

    protected $table = 'agentes';
    protected $primaryKey = 'id_agente';

    protected $fillable = [
        'nome',
        'telefone',
        'email',
        'documento',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // Relacionamentos
    public function user()
    {
        return $this->hasOne(User::class, 'perfil_id', 'id_agente')
                    ->where('perfil', 'agente');
    }

    public function corretoras()
    {
        return $this->belongsToMany(Corretora::class, 'agente_corretora', 'id_agente', 'id_corretora')
                    ->withPivot('data_inicio', 'data_fim', 'comissao_angariacao', 'comissao_cobranca', 'status')
                    ->withTimestamps();
    }

    public function corretorasAtivas()
    {
        return $this->corretoras()->wherePivot('status', true);
    }

    public function seguradoras()
    {
        return $this->belongsToMany(Seguradora::class, 'agente_seguradora', 'id_agente', 'id_seguradora')
                    ->withPivot('status', 'comissao_percentagem', 'data_inicio', 'data_fim')
                    ->withTimestamps();
    }

    public function seguradorasAtivas()
    {
        return $this->seguradoras()->wherePivot('status', true);
    }

    public function segurosSeguradoras()
    {
        return $this->belongsToMany(SeguradoraSeguro::class, 'agente_seguroseguradora', 'id_agente', 'id_seguro_seguradora')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    public function apolices()
    {
        return $this->hasMany(Apolice::class, 'agente_id', 'id_agente');
    }

    public function propostas()
    {
        return $this->hasMany(Proposta::class, 'agente_id', 'id_agente');
    }

    // Scopes
    public function scopeAtivo($query)
    {
        return $query->where('status', true);
    }

    public function scopeInativo($query)
    {
        return $query->where('status', false);
    }

    // Accessors
    public function getTotalApolicesAttribute()
    {
        return $this->apolices()->count();
    }

    public function getVinculoAtivoAttribute()
    {
        return $this->corretorasAtivas()->exists() || $this->seguradorasAtivas()->exists();
    }
}
