<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgenteSeguroSeguradora extends Model
{
    protected $table = 'agente_seguroseguradora';

    protected $fillable = [
        'id_agente',
        'id_seguro_seguradora',
        'status',
        'percentagem_comissao_angariacao',
        'percentagem_comissao_cobranca',
        'data_inicio',
        'data_fim',
    ];

    protected $casts = [
        'status'                          => 'boolean',
        'percentagem_comissao_angariacao' => 'decimal:2',
        'percentagem_comissao_cobranca'   => 'decimal:2',
        'data_inicio'                     => 'date',
        'data_fim'                        => 'date',
    ];

    public function agente()
    {
        return $this->belongsTo(Agente::class, 'id_agente', 'id_agente');
    }

    public function seguroSeguradora()
    {
        return $this->belongsTo(SeguradoraSeguro::class, 'id_seguro_seguradora', 'id');
    }

    public function comissoes()
    {
        return $this->hasMany(Comissao::class, 'agente_seguroseguradora_id');
    }
}

