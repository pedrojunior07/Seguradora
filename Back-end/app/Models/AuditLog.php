<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'auditable_id',
        'auditable_type',
        'description',
        'metadata',
        'old_values',
        'new_values',
        'ip_address'
    ];

    protected $casts = [
        'metadata' => 'array',
        'old_values' => 'array',
        'new_values' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function auditable()
    {
        return $this->morphTo();
    }

    /**
     * Helper para registrar log de forma simples
     */
    public static function log($action, Model $model, $description = null, $oldValues = null, $newValues = null)
    {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'auditable_id' => $model->getKey(),
            'auditable_type' => get_class($model),
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip()
        ]);
    }
}
