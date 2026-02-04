<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * Determine if the user has verified their email address.
     *
     * @return bool
     */
    public function hasVerifiedEmail()
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return ! is_null($this->email_verified_at);
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'perfil',
        'perfil_id',
        'seguradora_id',
        'status',
        'telefone',
        'ultimo_acesso',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'ultimo_acesso' => 'datetime',
            'status' => 'boolean',
        ];
    }

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'perfil' => $this->perfil,
            'perfil_id' => $this->perfil_id,
            'role' => $this->role,
        ];
    }

    // Relationships
    public function seguradora()
    {
        return $this->belongsTo(Seguradora::class, 'seguradora_id', 'id_seguradora');
    }

    public function corretora()
    {
        return $this->belongsTo(Corretora::class, 'perfil_id', 'id_corretora');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'perfil_id', 'id_cliente');
    }

    public function agente()
    {
        return $this->belongsTo(Agente::class, 'perfil_id', 'id_agente');
    }

    // Helpers
    public function isSeguradora(): bool
    {
        return $this->perfil === 'seguradora';
    }

    public function isCorretora(): bool
    {
        return $this->perfil === 'corretora';
    }

    public function isCliente(): bool
    {
        return $this->perfil === 'cliente';
    }

    public function isAgente(): bool
    {
        return $this->perfil === 'agente';
    }

    public function isAdmin(): bool
    {
        return $this->perfil === 'admin';
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin_system';
    }

    public function isOperador(): bool
    {
        return $this->role === 'operador';
    }

    public function getPerfilEntidade()
    {
        return match($this->perfil) {
            'seguradora' => $this->seguradora,
            'corretora' => $this->corretora,
            'cliente' => $this->cliente,
            'agente' => $this->agente,
            default => null,
        };
    }
}
