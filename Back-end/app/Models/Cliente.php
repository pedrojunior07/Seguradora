<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';

    protected static function booted()
    {
        static::addGlobalScope(new \App\Scopes\AgenteScope);
    }

    protected $fillable = [
        'agente_id', // Novo campo
        'tipo_cliente',
        'tipo_empresa', // Novo
        'nome',
        'nuit',
        'endereco',
        'telefone1',
        'telefone2',
        'documento',
        'email',
        // Uploads
        'upload_nuit',
        'upload_doc_representante',
        'upload_certidao_comercial',
        'upload_licenca',
        'upload_br',
    ];

    // Relacionamentos
    public function agente()
    {
        return $this->belongsTo(Agente::class, 'agente_id', 'id_agente');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'perfil_id', 'id_cliente')
                    ->where('perfil', 'cliente');
    }

    public function veiculos()
    {
        return $this->hasMany(Veiculo::class, 'id_cliente', 'id_cliente');
    }

    public function propriedades()
    {
        return $this->hasMany(PropriedadeCliente::class, 'cliente_id', 'id_cliente');
    }

    public function frotas()
    {
        return $this->hasMany(Frota::class, 'cliente_id', 'id_cliente');
    }

    public function apolices()
    {
        return $this->hasMany(Apolice::class, 'cliente_id', 'id_cliente');
    }

    public function apolicesAtivas()
    {
        return $this->apolices()->where('status', 'ativa');
    }

    public function propostas()
    {
        return $this->hasMany(Proposta::class, 'cliente_id', 'id_cliente');
    }

    public function pagamentos()
    {
        return $this->hasMany(Pagamento::class, 'cliente_id', 'id_cliente');
    }

    public function sinistros()
    {
        return $this->hasMany(Sinistro::class, 'cliente_id', 'id_cliente');
    }

    public function detalhesBancarios()
    {
        return $this->hasMany(DetalhesBancariosCliente::class, 'cliente_id', 'id_cliente');
    }

    public function detalheBancarioPrincipal()
    {
        return $this->hasOne(DetalhesBancariosCliente::class, 'cliente_id', 'id_cliente')
                    ->where('principal', true);
    }

    public function bensPenhora()
    {
        return $this->hasManyThrough(
            BemPenhora::class,
            PropClienteSeguradoraSeguro::class,
            'propriedade_cliente_id',
            'id_prop_seguroseguradora'
        );
    }

    // Scopes
    public function scopePessoaFisica($query)
    {
        return $query->where('tipo_cliente', 'fisica');
    }

    public function scopePessoaJuridica($query)
    {
        return $query->where('tipo_cliente', 'juridica');
    }

    // Accessors
    public function getTotalVeiculosAttribute()
    {
        return $this->veiculos()->count();
    }

    public function getTotalPropriedadesAttribute()
    {
        return $this->propriedades()->count();
    }

    public function getTotalApolicesAtivasAttribute()
    {
        return $this->apolicesAtivas()->count();
    }

    public function getIsPessoaJuridicaAttribute()
    {
        return $this->tipo_cliente === 'juridica';
    }
}
