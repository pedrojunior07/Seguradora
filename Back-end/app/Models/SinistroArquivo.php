<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SinistroArquivo extends Model
{
    use HasFactory;

    protected $table = 'sinistro_arquivos';
    protected $primaryKey = 'id_arquivo';

    protected $fillable = [
        'sinistro_id',
        'caminho',
        'tipo',
        'nome_original',
        'tamanho',
    ];

    public function sinistro()
    {
        return $this->belongsTo(Sinistro::class, 'sinistro_id', 'id_sinistro');
    }
}
