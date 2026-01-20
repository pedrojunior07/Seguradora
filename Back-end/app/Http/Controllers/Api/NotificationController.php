<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Listar notificações do utilizador autenticado.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = $user->notifications();

        if ($request->has('unread')) {
            $query = $user->unreadNotifications();
        }

        $notifications = $query->paginate($request->get('per_page', 20));

        return response()->json($notifications);
    }

    /**
     * Retornar contagem de notificações não lidas.
     */
    public function unreadCount()
    {
        return response()->json([
            'count' => Auth::user()->unreadNotifications()->count()
        ]);
    }

    /**
     * Marcar uma notificação como lida.
     */
    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Notificação marcada como lida']);
    }

    /**
     * Marcar todas as notificações como lidas.
     */
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Todas as notificações foram marcadas como lidas']);
    }

    /**
     * Remover uma notificação.
     */
    public function destroy($id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notificação removida']);
    }
}
