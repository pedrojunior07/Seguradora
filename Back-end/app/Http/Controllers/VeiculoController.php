<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Veiculo;

class VeiculoController extends Controller
{
    public function index() { return Veiculo::all(); }
    public function store(Request $request) { return Veiculo::create($request->all()); }
    public function show($id) { return Veiculo::findOrFail($id); }
    public function update(Request $request, $id) { 
        $veiculo = Veiculo::findOrFail($id); 
        $veiculo->update($request->all()); 
        return $veiculo; 
    }
    public function destroy($id) { Veiculo::destroy($id); return response()->noContent(); }
}
