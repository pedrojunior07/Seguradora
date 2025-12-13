<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Frota extends Model
{
    protected $fillable = ['cliente_id', 'nome_frota', 'descricao'];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function veiculos()
    {
        return $this->hasMany(Veiculo::class);
    }
}
