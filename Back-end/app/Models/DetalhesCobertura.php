<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalhesCobertura extends Model
{
    protected $table = 'detalhes_cobertura';

    protected $primaryKey = 'id_cobertura';

    protected $fillable = [
        'id_seguro_seguradora',
        'descricao',
        'valor_maximo',
        'franquia'
    ];

    protected $casts = [
        'franquia' => 'decimal:2',
        'valor_maximo' => 'decimal:2',
    ];

    // Relacionamentos
    public function seguradoraSeguro()
    {
        return $this->belongsTo(SeguradoraSeguro::class, 'id_seguro_seguradora', 'id');
    }
}
