<?php

namespace App\Http\Requests\Seguradora;

use Illuminate\Foundation\Http\FormRequest;

class GerirCorretoraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSeguradora();
    }

    public function rules(): array
    {
        return [
            'acao' => 'required|in:aprovar,rejeitar,suspender',
            'comissao_percentagem' => 'required_if:acao,aprovar|numeric|min:0|max:100',
            'observacoes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'acao.required' => 'A ação é obrigatória',
            'acao.in' => 'Ação inválida',
            'comissao_percentagem.required_if' => 'A comissão é obrigatória para aprovação',
        ];
    }
}
