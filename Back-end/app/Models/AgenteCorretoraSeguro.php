<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgenteCorretoraSeguro extends Model
{
    protected $table = 'agente_corretora_seguro';
    protected $primaryKey = 'id_agente_corretora_seguro';

    protected $fillable = [
        'id_agente',
        'id_corretora_seguroseguradora',
        'percentagem_comissao_angariacao',
        'percentagem_comissao_cobranca',
        'estado',
        'data_inicio',
        'data_fim'
    ];

    public function agente()
    {
        return $this->belongsTo(Agente::class, 'id_agente', 'id_agente');
    }

    public function corretoraSeguroSeguradora()
    {
        return $this->belongsTo(CorretoraSeguroSeguradora::class, 'id_corretora_seguroseguradora', 'id');
    }
}
