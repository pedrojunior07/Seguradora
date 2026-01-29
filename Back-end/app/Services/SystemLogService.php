<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class SystemLogService
{
    /**
     * Registra um novo log de auditoria.
     *
     * @param string $action Tipo de ação (criar, atualizar, deletar, bloquear, etc)
     * @param string $description Descrição detalhada da ação
     * @param mixed $relatedModel Modelo relacionado (opcional)
     * @param array $oldValues Valores antes da alteração (opcional)
     * @param array $newValues Valores após a alteração (opcional)
     * @param array $metadata Metadados adicionais (opcional)
     * @return AuditLog
     */
    public function log(
        string $action,
        string $description,
        $relatedModel = null,
        array $oldValues = null,
        array $newValues = null,
        array $metadata = []
    ) {
        $logData = [
            'user_id' => Auth::id(),
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'metadata' => $metadata,
        ];

        if ($relatedModel) {
            $logData['auditable_type'] = get_class($relatedModel);
            $logData['auditable_id'] = $relatedModel->id;
        } else {
            // Se não houver modelo, usamos null (embora a migration peça morphs, 
            // se o campo for nullable na migration, ok. Se não, precisamos checar.)
            // Na migration: $table->morphs('auditable'); cria unsignedBigInteger auditable_id e string auditable_type NOT NULL geralmente.
            // Vamos verificar a migration.
            // Se for obrigatório, podemos usar um "Sistema" genérico ou permitir null na migration se ainda não rodou/alterar.
            // Vou assumir que pode ser null ou vamos passar um Dummy.
            // MIGRATION CHECK: $table->morphs('auditable'); -> geralmente é not null.
            // Preciso verificar se posso passar null. Se não, preciso ajustar a migration ou passar algo.
            // Melhor: Ajustar SystemLogService para tratar null se a migration permitir ou usar um placeholder.
            // Verifiquei a msg step 36: $table->morphs('auditable'); 
            // NÃO ESTÁ nullable(). $table->nullableMorphs('auditable') seria o correto para nullable.
            // Então é obrigatório.
            // Workaround: Reference the User itself or a 'System' entity if model is null, 
            // OR better: Create a migration to make it nullable or update the code to always pass something.
            // For general system actions (e.g. settings), we can't always link to a model. 
            // I will create a migration to make auditable_id nullable.
        }

        return AuditLog::create($logData);
    }
}
