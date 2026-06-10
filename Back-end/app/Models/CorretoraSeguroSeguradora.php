<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorretoraSeguroSeguradora extends Model
{
    protected $table = 'corretora_seguroseguradora';

    protected $fillable = [
        'id_corretora',
        'id_seguro_seguradora',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function corretora()
    {
        return $this->belongsTo(Corretora::class, 'id_corretora', 'id_corretora');
    }

    public function seguroSeguradora()
    {
        return $this->belongsTo(SeguradoraSeguro::class, 'id_seguro_seguradora', 'id');
    }
}
