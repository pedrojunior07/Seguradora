<?php

namespace App\Http\Requests\Corretora;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCorretora();
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'telefone' => 'required|string|max:20',
            'email' => 'required|email|unique:agentes,email',
            'documento' => 'nullable|string|max:50',
            'comissao_angariacao' => 'required|numeric|min:0|max:100',
            'comissao_cobranca' => 'required|numeric|min:0|max:100',
        ];
    }
}
