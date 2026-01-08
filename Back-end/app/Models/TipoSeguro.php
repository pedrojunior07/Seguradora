<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoSeguro extends Model
{
    use HasFactory;

    protected $table = 'tipos_seguro';

    protected $fillable = [
        'id_categoria',
        'descricao',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id_categoria');
    }
}
