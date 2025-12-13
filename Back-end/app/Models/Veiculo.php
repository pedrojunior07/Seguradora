<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Veiculo extends Model
{
    protected $fillable = [
        'cliente_id',
        'frota_id',
        'marca',
        'modelo',
        'matricula',
        'valor_estimado'
    ];

    public function frota()
    {
        return $this->belongsTo(Frota::class);
    }

    public function seguros()
    {
        return $this->hasMany(VeiculoSeguroSeguradora::class);
    }
}

