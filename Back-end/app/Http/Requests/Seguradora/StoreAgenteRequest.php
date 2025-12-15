<?php

namespace App\Http\Requests\Seguradora;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSeguradora();
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'telefone' => 'required|string|max:20',
            'email' => 'required|email|unique:agentes,email',
            'documento' => 'nullable|string|max:50',
            'comissao_percentagem' => 'required|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do agente é obrigatório',
            'telefone.required' => 'O telefone é obrigatório',
            'email.required' => 'O email é obrigatório',
            'email.unique' => 'Este email já está em uso',
            'comissao_percentagem.required' => 'A percentagem de comissão é obrigatória',
        ];
    }
}
