<?php

namespace App\Http\Requests\Seguradora;

use Illuminate\Foundation\Http\FormRequest;

class StoreCoberturaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSeguradora();
    }

    public function rules(): array
    {
        return [
            'id_seguro_seguradora' => 'required|exists:seguradora_seguro,id',
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'valor_maximo' => 'required|numeric|min:0',
            'franquia' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'id_seguro_seguradora.required' => 'O seguro é obrigatório',
            'nome.required' => 'O nome da cobertura é obrigatório',
            'valor_maximo.required' => 'O valor máximo é obrigatório',
        ];
    }
}
