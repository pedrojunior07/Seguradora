<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SystemLog;
use App\Services\SystemLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GovernanceController extends Controller
{
    protected $logService;

    public function __construct(SystemLogService $logService)
    {
        $this->logService = $logService;
    }

    // Listar todos os usuários (Entidades)
    public function indexUsers(Request $request)
    {
        // Filtros podem ser adicionados aqui
        $users = User::with(['seguradora', 'corretora', 'cliente', 'agente'])
            ->where('role', '!=', 'super_admin_system')
            ->paginate(15);
        
        return response()->json($users);
    }

    // Toggle Status (Bloquear/Desbloquear)
    public function toggleUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'super_admin_system') {
             return response()->json(['message' => 'Não é possível alterar status de um super admin.'], 403);
        }

        $oldStatus = $user->status;
        $user->status = !$user->status;
        $user->save();

        $action = $user->status ? 'ativar' : 'bloquear';
        $description = "Usuário {$user->email} foi " . ($user->status ? 'ativado' : 'bloqueado') . ".";

        $this->logService->log(
            $action, 
            $description, 
            $user, 
            ['status' => $oldStatus], 
            ['status' => $user->status]
        );

        return response()->json(['message' => 'Status alterado com sucesso.', 'user' => $user]);
    }

    // Settings (Simulado para MVP, idealmente usar model SystemSettings)
    public function getSettings() {
        $settings = DB::table('system_settings')->get();
        return response()->json($settings);
    }

    public function updateSetting(Request $request) {
        $request->validate([
            'key' => 'required|string',
            'value' => 'required',
        ]);

        $key = $request->key;
        $value = $request->value;

        // Check if setting exists
        $setting = DB::table('system_settings')->where('key', $key)->first();
        
        $oldValue = $setting ? $setting->value : null;

        if ($setting) {
             DB::table('system_settings')->where('key', $key)->update([
                 'value' => $value, 
                 'updated_at' => now()
             ]);
        } else {
             DB::table('system_settings')->insert([
                 'key' => $key,
                 'value' => $value,
                 'created_at' => now(),
                 'updated_at' => now()
             ]);
        }

        $this->logService->log(
            'configuracao',
            "Configuração '{$key}' atualizada.",
            null, // No specific model
            ['value' => $oldValue],
            ['value' => $value],
            ['key' => $key]
        );

        return response()->json(['message' => 'Configuração salva.']);
    }

    // Audit Logs
    public function getAuditLogs(Request $request) {
        $logs = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
            ->select('audit_logs.*', 'users.name as user_name', 'users.email as user_email')
            ->orderBy('audit_logs.created_at', 'desc')
            ->paginate(20);

        return response()->json($logs);
    }
}
