<?php

namespace App\Http\Requests\Seguros;

use Illuminate\Foundation\Http\FormRequest;

class CriarSeguroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_categoria' => 'required|exists:categorias,id_categoria',
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'id_tipo_seguro' => 'required|exists:tipos_seguro,id',
            'premio_minimo' => 'required|numeric|min:0',
            'valor_minimo_dano' => 'nullable|numeric|min:0',
            'status' => 'nullable|boolean',
            'preco' => 'nullable|array',
            'preco.valor' => 'nullable|numeric|min:0',
            'preco.premio_percentagem' => 'nullable|numeric|min:0|max:100',
            'preco.premio_valor' => 'nullable|numeric|min:0',
            'preco.usaValor' => 'nullable|boolean',
            'preco.data_inicio' => 'nullable|date',
            'preco.data_fim' => 'nullable|date|after:preco.data_inicio',
            'coberturas' => 'nullable|array',
            'coberturas.*.descricao' => 'required|string',
            'coberturas.*.franquia' => 'nullable|numeric|min:0|max:100',
            'coberturas.*.valor_minimo' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'id_categoria.required' => 'A categoria é obrigatória',
            'id_categoria.exists' => 'Categoria inválida',
            'nome.required' => 'O nome do seguro é obrigatório',
            'id_tipo_seguro.required' => 'O tipo de seguro é obrigatório',
            'id_tipo_seguro.exists' => 'Tipo de seguro inválido',
            'premio_minimo.required' => 'O prêmio mínimo é obrigatório',
        ];
    }
}
