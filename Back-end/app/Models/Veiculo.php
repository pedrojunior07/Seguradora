<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Veiculo extends Model
{
    use HasFactory;

    protected $table = 'veiculos';
    protected $primaryKey = 'id_veiculo';

    protected $fillable = [
        'id_cliente',
        'marca',
        'modelo',
        'ano_fabrico',
        'cor',
        'matricula',
        'chassi',
        'valor_estimado',
        'tipo_veiculo',
    ];

    protected $casts = [
        'valor_estimado' => 'decimal:2',
        'ano_fabrico' => 'integer',
    ];

    // Relacionamentos
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function frotas()
    {
        return $this->belongsToMany(Frota::class, 'frota_veiculo', 'veiculo_id', 'frota_id')
                    ->withTimestamps();
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
        return $this->belongsToMany(SeguradoraSeguro::class, 'veiculo_seguradora_seguro', 'veiculo_id', 'seguradora_seguro_id')
                    ->withPivot('estado', 'data_associacao')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeDoCliente($query, $clienteId)
    {
        return $query->where('id_cliente', $clienteId);
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
        return $query->where('tipo_veiculo', $tipo);
    }

    // Accessors
    public function getDescricaoCompletaAttribute()
    {
        return "{$this->marca} {$this->modelo} ({$this->ano_fabrico}) - {$this->matricula}";
    }

    public function getTemSeguroAtivoAttribute()
    {
        return $this->apoliceAtiva()->exists();
    }

    public function getIdadeVeiculoAttribute()
    {
        return now()->year - $this->ano_fabrico;
    }
}
