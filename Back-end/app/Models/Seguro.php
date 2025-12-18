<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seguro extends Model
{
    use HasFactory;

    protected $table = 'seguros';
    protected $primaryKey = 'id_seguro';

    const CREATED_AT = 'data_criacao';
    const UPDATED_AT = 'data_atualizacao';

    protected $fillable = [
        'id_categoria',
        'nome',
        'descricao',
        'tipo_seguro',
        'data_criacao',
        'data_atualizacao',
    ];

    protected $casts = [
        'data_criacao' => 'date',
        'data_atualizacao' => 'date',
    ];

    // Relacionamentos
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id_categoria');
    }

    public function seguradoras()
    {
        return $this->belongsToMany(Seguradora::class, 'seguradora_seguro', 'id_seguro', 'id_seguradora')
                    ->withPivot('premio_minimo', 'status', 'valor_minimo_dano')
                    ->withTimestamps();
    }

    public function seguradoraSeguros()
    {
        return $this->hasMany(SeguradoraSeguro::class, 'id_seguro', 'id_seguro');
    }

    // Scopes
    public function scopeVeiculo($query)
    {
        return $query->where('tipo_seguro', 'veiculo');
    }

    public function scopePropriedade($query)
    {
        return $query->where('tipo_seguro', 'propriedade');
    }

    public function scopeDaCategoria($query, $categoriaId)
    {
        return $query->where('id_categoria', $categoriaId);
    }

    // Accessors
    public function getTotalSeguradorasAttribute()
    {
        return $this->seguradoras()->wherePivot('status', true)->count();
    }
}
