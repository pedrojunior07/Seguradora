<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropriedadeCliente extends Model
{
    use HasFactory;

    protected $table = 'propriedade_cliente';

    protected $fillable = [
        'cliente_id',
        'tipo_propriedade',
        'descricao',
        'endereco',
        'valor_estimado',
        'data_avaliacao',
        'estado',
    ];

    protected $casts = [
        'valor_estimado' => 'decimal:2',
        'data_avaliacao' => 'date',
    ];

    // Relacionamentos
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id', 'id_cliente');
    }

    public function apolices()
    {
        return $this->morphMany(Apolice::class, 'bem_segurado', 'bem_segurado_type', 'bem_segurado_id');
    }

    public function apoliceAtiva()
    {
        return $this->morphOne(Apolice::class, 'bem_segurado', 'bem_segurado_type', 'bem_segurado_id')
                    ->where('status', 'ativa');
    }

    public function propostas()
    {
        return $this->morphMany(Proposta::class, 'bem', 'bem_type', 'bem_id');
    }

    public function segurosSeguradoras()
    {
        return $this->belongsToMany(SeguradoraSeguro::class, 'prop_cliente_seg_seguro', 'propriedade_cliente_id', 'seguradora_seguro_id')
                    ->withPivot('status', 'data_registo', 'data_inicio', 'data_fim', 'premio', 'observacoes')
                    ->withTimestamps();
    }

    public function bensPenhora()
    {
        return $this->hasManyThrough(
            BemPenhora::class,
            PropClienteSeguradoraSeguro::class,
            'propriedade_cliente_id',
            'id_prop_seguroseguradora',
            'id',
            'id'
        );
    }

    // Scopes
    public function scopeDoCliente($query, $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }

    public function scopeAtivo($query)
    {
        return $query->where('estado', 'ativo');
    }

    public function scopeComSeguro($query)
    {
        return $query->whereHas('apolices', function ($q) {
            $q->where('status', 'ativa');
        });
    }

    public function scopeSemSeguro($query)
    {
        return $query->whereDoesntHave('apolices', function ($q) {
            $q->where('status', 'ativa');
        });
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_propriedade', $tipo);
    }

    // Accessors
    public function getDescricaoCompletaAttribute()
    {
        return "{$this->tipo_propriedade}: {$this->descricao}";
    }

    public function getTemSeguroAtivoAttribute()
    {
        return $this->apoliceAtiva()->exists();
    }
}
