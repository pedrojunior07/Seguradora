<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\AuditLog::with(['user']);

        // Se não for super admin, filtrar apenas pelas próprias ações
        if ($user->role !== 'super_admin') {
            $query->where('user_id', $user->id);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }
}
