<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Seguradora;

class SeguradoraController extends Controller
{
    public function index() { return Seguradora::all(); }
    public function store(Request $request) { return Seguradora::create($request->all()); }
    public function show($id) { return Seguradora::findOrFail($id); }
    public function update(Request $request, $id) { 
        $seguradora = Seguradora::findOrFail($id); 
        $seguradora->update($request->all()); 
        return $seguradora; 
    }
    public function destroy($id) { Seguradora::destroy($id); return response()->noContent(); }
}
