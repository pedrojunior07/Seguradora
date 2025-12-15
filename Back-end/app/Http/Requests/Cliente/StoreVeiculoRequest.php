<?php

namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;

class StoreVeiculoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCliente();
    }

    public function rules(): array
    {
        return [
            'marca' => 'required|string|max:100',
            'modelo' => 'required|string|max:100',
            'ano_fabrico' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'cor' => 'nullable|string|max:50',
            'matricula' => 'required|string|max:20|unique:veiculos,matricula',
            'chassi' => 'required|string|max:50|unique:veiculos,chassi',
            'valor_estimado' => 'required|numeric|min:0',
            'tipo_veiculo' => 'required|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'marca.required' => 'A marca é obrigatória',
            'modelo.required' => 'O modelo é obrigatório',
            'matricula.required' => 'A matrícula é obrigatória',
            'matricula.unique' => 'Esta matrícula já está registada',
            'chassi.required' => 'O chassi é obrigatório',
            'chassi.unique' => 'Este chassi já está registado',
            'valor_estimado.required' => 'O valor estimado é obrigatório',
        ];
    }
}
