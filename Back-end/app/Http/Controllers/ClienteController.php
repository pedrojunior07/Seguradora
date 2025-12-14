<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;

class ClienteController extends Controller
{
    // Listar todos clientes
    public function index()
    {
        return Cliente::all();
    }

    // Criar novo cliente
    public function store(Request $request)
    {
        $cliente = Cliente::create($request->all());
        return response()->json($cliente, 201);
    }

    // Mostrar cliente específico
    public function show($id)
    {
        return Cliente::findOrFail($id);
    }

    // Atualizar cliente
    public function update(Request $request, $id)
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->update($request->all());
        return response()->json($cliente, 200);
    }

    // Deletar cliente
    public function destroy($id)
    {
        Cliente::destroy($id);
        return response()->json(null, 204);
    }
}
