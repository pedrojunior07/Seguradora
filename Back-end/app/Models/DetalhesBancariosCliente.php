<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalhesBancariosCliente extends Model
{
    use HasFactory;

    protected $table = 'detalhes_bancarios_cliente';

    protected $fillable = [
        'cliente_id',
        'nome_banco',
        'codigo_banco',
        'agencia',
        'numero_conta',
        'tipo_conta',
        'titular',
        'cpf_cnpj_titular',
        'principal',
        'ativo',
    ];

    protected $casts = [
        'principal' => 'boolean',
        'ativo' => 'boolean',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id', 'id_cliente');
    }

    public function scopeAtivo($query)
    {
        return $query->where('ativo', true);
    }

    public function scopePrincipal($query)
    {
        return $query->where('principal', true);
    }

    public function definirComoPrincipal(): bool
    {
        // Remove principal de outros
        static::where('cliente_id', $this->cliente_id)
              ->where('id', '!=', $this->id)
              ->update(['principal' => false]);

        $this->principal = true;
        return $this->save();
    }
}
