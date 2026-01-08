<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClienteSeguroPropriedade extends Model
{
    use HasFactory;

    const STATUS_PROPOSTA = 'proposta';
    const STATUS_EM_ANALISE = 'em_analise';
    const STATUS_ATIVO = 'ativo';
    const STATUS_REJEITADO = 'rejeitado';
    const STATUS_CANCELADO = 'cancelado';

    protected $table = 'cliente_seguro_propriedade';

    protected $fillable = [
        'id_propriedade',
        'id_seguradora_seguro',
        'id_preco',
        'valor_bem',
        'premio_final',
        'status',
    ];

    public function propriedade(): BelongsTo
    {
        return $this->belongsTo(PropriedadeCliente::class, 'id_propriedade');
    }

    public function seguradoraSeguro(): BelongsTo
    {
        return $this->belongsTo(SeguradoraSeguro::class, 'id_seguradora_seguro');
    }

    public function preco(): BelongsTo
    {
        return $this->belongsTo(Preco::class, 'id_preco');
    }
}
