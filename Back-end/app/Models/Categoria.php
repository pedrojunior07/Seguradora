<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table = 'categorias';
    protected $primaryKey = 'id_categoria';

    protected $fillable = ['descricao'];

    // Relacionamentos
    public function seguros()
    {
        return $this->hasMany(Seguro::class, 'id_categoria', 'id_categoria');
    }

    // Accessors
    public function getTotalSegurosAttribute()
    {
        return $this->seguros()->count();
    }
}

