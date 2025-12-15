<?php

namespace App\Http\Requests\Seguradora;

use Illuminate\Foundation\Http\FormRequest;

class StoreSeguroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSeguradora();
    }

    public function rules(): array
    {
        return [
            'id_categoria' => 'required|exists:categorias,id_categoria',
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'tipo_seguro' => 'required|in:veiculo,propriedade',
            'premio_minimo' => 'required|numeric|min:0',
            'valor_minimo_dano' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'id_categoria.required' => 'A categoria é obrigatória',
            'id_categoria.exists' => 'Categoria não encontrada',
            'nome.required' => 'O nome do seguro é obrigatório',
            'tipo_seguro.required' => 'O tipo de seguro é obrigatório',
            'tipo_seguro.in' => 'Tipo de seguro inválido',
            'premio_minimo.required' => 'O prémio mínimo é obrigatório',
            'premio_minimo.min' => 'O prémio mínimo deve ser positivo',
        ];
    }
}
