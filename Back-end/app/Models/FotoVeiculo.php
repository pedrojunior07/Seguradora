<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FotoVeiculo extends Model
{
    use HasFactory;

    protected $table = 'fotos_veiculos';

    protected $fillable = [
        'id_veiculo',
        'tipo',
        'caminho'
    ];

    public function veiculo()
    {
        return $this->belongsTo(Veiculo::class, 'id_veiculo', 'id_veiculo');
    }
}
