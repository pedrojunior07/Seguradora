<?php

namespace App\Http\Requests\Seguros;

use Illuminate\Foundation\Http\FormRequest;

class AdicionarCoberturaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'descricao' => 'required|string',
            'franquia' => 'nullable|numeric|min:0|max:100',
            'valor_minimo' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'descricao.required' => 'A descrição da cobertura é obrigatória',
        ];
    }
}
