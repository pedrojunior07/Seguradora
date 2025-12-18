<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalhesBancarios extends Model
{
    protected $table = 'detalhes_bancarios';

    protected $fillable = [
        'nome_banco',
        'numero_conta',
        'titular',
        'id_seguradora'
    ];

    // Relacionamentos
    public function seguradora()
    {
        return $this->belongsTo(Seguradora::class, 'id_seguradora', 'id_seguradora');
    }
}

