<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relationship;
use Illuminate\Database\Eloquent\Relations\Pivot;

class VeiculoSeguradoraSeguro extends Pivot
{
    use HasFactory;

    protected $table = 'veiculo_seguradora_seguro';

    // Como é um Pivot com ID Auto-increment (segundo a migration 'id()')
    public $incrementing = true; 

    protected $fillable = [
        'veiculo_id',
        'seguradora_seguro_id',
        'estado',
        'data_associacao',
    ];

    protected $casts = [
        'data_associacao' => 'date',
    ];

    // Relacionamentos para facilitar navegação
    public function veiculo()
    {
        return $this->belongsTo(Veiculo::class, 'veiculo_id', 'id_veiculo');
    }

    public function seguradoraSeguro()
    {
        return $this->belongsTo(SeguradoraSeguro::class, 'seguradora_seguro_id');
    }
}
