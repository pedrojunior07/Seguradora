<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VeiculoFoto extends Model
{
    use HasFactory;

    protected $table = 'veiculo_fotos';

    protected $fillable = [
        'id_veiculo',
        'categoria',
        'caminho_arquivo',
    ];

    public function veiculo()
    {
        return $this->belongsTo(Veiculo::class, 'id_veiculo', 'id_veiculo');
    }
}
