<?php

namespace App\Http\Requests\Seguros;

use Illuminate\Foundation\Http\FormRequest;

class AtualizarSeguroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_categoria' => 'sometimes|exists:categorias,id_categoria',
            'nome' => 'sometimes|string|max:255',
            'descricao' => 'nullable|string',
            'tipo_seguro' => 'sometimes|string|in:veiculo,propriedade,vida,saude',
            'premio_minimo' => 'sometimes|numeric|min:0',
            'valor_minimo_dano' => 'nullable|numeric|min:0',
            'status' => 'sometimes|boolean',
            'auto_aprovacao' => 'sometimes|boolean',
        ];
    }
}
