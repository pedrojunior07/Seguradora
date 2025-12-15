<?php

namespace App\Http\Requests\Corretora;

use Illuminate\Foundation\Http\FormRequest;

class StorePropostaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCorretora();
    }

    public function rules(): array
    {
        return [
            'cliente_id' => 'required|exists:clientes,id_cliente',
            'seguradora_seguro_id' => 'required|exists:seguradora_seguro,id',
            'tipo_proposta' => 'required|in:veiculo,propriedade',
            'bem_id' => 'required|integer',
            'valor_bem' => 'required|numeric|min:0',
            'coberturas_selecionadas' => 'required|array|min:1',
            'coberturas_selecionadas.*' => 'exists:detalhes_cobertura,id_cobertura',
            'parcelas_sugeridas' => 'required|integer|min:1|max:12',
            'data_inicio_proposta' => 'required|date|after_or_equal:today',
            'data_fim_proposta' => 'required|date|after:data_inicio_proposta',
            'observacoes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.required' => 'O cliente é obrigatório',
            'seguradora_seguro_id.required' => 'O seguro é obrigatório',
            'bem_id.required' => 'O bem a segurar é obrigatório',
            'coberturas_selecionadas.required' => 'Selecione pelo menos uma cobertura',
        ];
    }
}
