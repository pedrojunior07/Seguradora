<?php

namespace App\Http\Requests\Seguros;

use Illuminate\Foundation\Http\FormRequest;

class AdicionarPrecoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'valor' => 'required|numeric|min:0',
            'premio_percentagem' => 'nullable|numeric|min:0|max:100',
            'premio_valor' => 'nullable|numeric|min:0',
            'usaValor' => 'required|boolean',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date|after:data_inicio',
        ];
    }

    public function messages(): array
    {
        return [
            'valor.required' => 'O valor é obrigatório',
            'usaValor.required' => 'Defina se usa valor fixo ou percentagem',
            'data_fim.after' => 'A data fim deve ser posterior à data início',
        ];
    }
}
