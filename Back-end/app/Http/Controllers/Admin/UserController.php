<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('perfil')) {
            $query->where('perfil', $request->perfil);
        }

        $users = $query->paginate(15);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        // Criação de usuários admins ou outros pelo admin
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|string',
            'perfil' => 'required|string'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'], // ex: super_admin, admin, operador
            'perfil' => $validated['perfil'],
            'status' => true
        ]);

        return response()->json($user, 201);
    }
}
