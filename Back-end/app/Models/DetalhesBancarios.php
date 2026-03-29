<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalhesBancarios extends Model
{
    protected $table = 'detalhes_bancarios';

    protected $fillable = [
        'nome_banco',
        'codigo_banco',
        'agencia',
        'numero_conta',
        'tipo_conta',
        'titular',
        'nuit_titular',
        'principal',
        'bankable_id',
        'bankable_type'
    ];

    // Relacionamentos
    public function bankable()
    {
        return $this->morphTo();
    }
}

