<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalhesBancarios extends Model
{
    protected $fillable = [
        'nome_banco',
        'numero_conta',
        'titular',
        'seguradora_id'
    ];

    public function seguradora()
    {
        return $this->belongsTo(Seguradora::class);
    }
}

