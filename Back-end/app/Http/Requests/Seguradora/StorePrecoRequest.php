<?php

namespace App\Http\Requests\Seguradora;

use Illuminate\Foundation\Http\FormRequest;

class StorePrecoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSeguradora();
    }

    public function rules(): array
    {
        return [
            'seguradora_seguro_id' => 'required|exists:seguradora_seguro,id',
            'valor' => 'required|numeric|min:0',
            'premio_percentagem' => 'required|numeric|min:0|max:100',
            'premio_valor' => 'required|numeric|min:0',
            'usa_valor' => 'boolean',
            'data_inicio' => 'required|date',
            'data_fim' => 'nullable|date|after:data_inicio',
        ];
    }
}
