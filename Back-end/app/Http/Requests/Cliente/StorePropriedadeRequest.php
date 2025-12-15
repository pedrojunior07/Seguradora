<?php

namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;

class StorePropriedadeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCliente();
    }

    public function rules(): array
    {
        return [
            'tipo_propriedade' => 'required|string|max:100',
            'descricao' => 'required|string|max:500',
            'endereco' => 'nullable|string|max:255',
            'valor_estimado' => 'required|numeric|min:0',
            'data_avaliacao' => 'nullable|date|before_or_equal:today',
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_propriedade.required' => 'O tipo de propriedade é obrigatório',
            'descricao.required' => 'A descrição é obrigatória',
            'valor_estimado.required' => 'O valor estimado é obrigatório',
        ];
    }
}
