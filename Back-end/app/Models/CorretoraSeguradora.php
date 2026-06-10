<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorretoraSeguradora extends Model
{
    protected $table = 'corretora_seguradora';

    protected $fillable = [
        'id_corretora',
        'id_seguradora',
        'status',
        'data_inicio',
        'data_fim',
        'comissao_percentagem',
        'observacoes',
        'data_aprovacao',
        'aprovado_por',
    ];

    protected $casts = [
        'data_inicio'    => 'date',
        'data_fim'       => 'date',
        'data_aprovacao' => 'datetime',
    ];

    public function corretora()
    {
        return $this->belongsTo(Corretora::class, 'id_corretora', 'id_corretora');
    }

    public function seguradora()
    {
        return $this->belongsTo(Seguradora::class, 'id_seguradora', 'id_seguradora');
    }
}
