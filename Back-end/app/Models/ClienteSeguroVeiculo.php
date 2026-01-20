<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClienteSeguroVeiculo extends Model
{
    use HasFactory;

    const STATUS_PROPOSTA = 'proposta';
    const STATUS_EM_ANALISE = 'em_analise';
    const STATUS_ATIVO = 'ativo';
    const STATUS_REJEITADO = 'rejeitado';
    const STATUS_CANCELADO = 'cancelado';

    protected $table = 'cliente_seguro_veiculo';

    protected $fillable = [
        'id_veiculo',
        'id_seguradora_seguro',
        'id_preco',
        'valor_bem',
        'premio_final',
        'status',
        'quilometragem_atual',
        'tipo_uso',
        'estado_pneus',
        'estado_vidros',
        'estado_cadeiras',
        'estado_bagageira',
        'estado_eletronicos',
        'estado_acessorios',
        'foto_pneus',
        'foto_vidros',
        'foto_cadeiras',
        'foto_bagageira',
        'foto_eletronicos',
        'foto_acessorios',
        'foto_frente',
        'foto_traseira',
        'foto_lado_esquerdo',
        'foto_lado_direito',
    ];

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class, 'id_veiculo', 'id_veiculo');
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
