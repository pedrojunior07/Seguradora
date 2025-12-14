<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;

class CategoriaController extends Controller
{
    public function index() { return Categoria::all(); }
    public function store(Request $request) { return Categoria::create($request->all()); }
    public function show($id) { return Categoria::findOrFail($id); }
    public function update(Request $request, $id) { 
        $categoria = Categoria::findOrFail($id); 
        $categoria->update($request->all()); 
        return $categoria; 
    }
    public function destroy($id) { Categoria::destroy($id); return response()->noContent(); }
}

