<?php

namespace App\Http\Requests\Seguradora;

use Illuminate\Foundation\Http\FormRequest;

class AprovarApoliceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSeguradora();
    }

    public function rules(): array
    {
        return [
            'observacoes' => 'nullable|string',
        ];
    }
}
