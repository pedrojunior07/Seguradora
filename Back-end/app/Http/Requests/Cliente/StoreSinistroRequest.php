<?php

namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;

class StoreSinistroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCliente();
    }

    public function rules(): array
    {
        return [
            'apolice_id' => 'required|exists:apolices,id_apolice',
            'data_ocorrencia' => 'required|date',
            'local_ocorrencia' => 'required|string|max:255',
            'descricao_ocorrencia' => 'required|string|min:20',
            'tipo_sinistro' => 'required|string|max:100',
            'causa_provavel' => 'nullable|string|max:255',
            'valor_estimado_dano' => 'nullable|numeric|min:0',
            'envolve_terceiros' => 'boolean',
            'dados_terceiros' => 'nullable|array',
            'dados_terceiros.*.nome' => 'required_with:dados_terceiros|string',
            'dados_terceiros.*.telefone' => 'nullable|string',
            'dados_terceiros.*.veiculo' => 'nullable|string',
            'numero_bo' => 'nullable|string|max:50',
            'data_bo' => 'nullable|date|before_or_equal:today',
            'observacoes' => 'nullable|string',
            'arquivos' => 'nullable|array',
            'arquivos.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240', // 10MB max
        ];
    }

    public function messages(): array
    {
        return [
            'apolice_id.required' => 'A apólice é obrigatória',
            'apolice_id.exists' => 'Apólice não encontrada',
            'data_ocorrencia.required' => 'A data da ocorrência é obrigatória',
            'local_ocorrencia.required' => 'O local da ocorrência é obrigatório',
            'descricao_ocorrencia.required' => 'A descrição é obrigatória',
            'descricao_ocorrencia.min' => 'A descrição deve ter pelo menos 20 caracteres',
            'tipo_sinistro.required' => 'O tipo de sinistro é obrigatório',
        ];
    }
}
