<?php

namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;

class StorePagamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCliente();
    }

    public function rules(): array
    {
        return [
            'pagamento_id' => 'required|exists:pagamentos,id_pagamento',
            'metodo_pagamento_id' => 'required|exists:metodo_pagamentos,id',
            'referencia_pagamento' => 'nullable|string|max:100',
            'comprovante' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'pagamento_id.required' => 'O pagamento é obrigatório',
            'metodo_pagamento_id.required' => 'O método de pagamento é obrigatório',
            'comprovante.max' => 'O comprovante não pode exceder 5MB',
        ];
    }
}
