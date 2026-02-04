<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'perfil' => 'required|in:seguradora,corretora,cliente',
            'telefone' => 'nullable|string|max:20',
        ];

        // Regras específicas por perfil
        if ($this->perfil === 'seguradora') {
            $rules['nome_empresa'] = 'required|string|max:255';
            $rules['nome_responsavel'] = 'nullable|string|max:255';
            $rules['nuit'] = 'required|string|unique:seguradoras,nuit';
            $rules['telefone1'] = 'required|string|max:20';
            $rules['telefone2'] = 'nullable|string|max:20';
            $rules['endereco'] = 'nullable|string|max:255';
            $rules['licenca'] = 'nullable|string|max:100';
            $rules['logo'] = 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048';
        }

        if ($this->perfil === 'corretora') {
            $rules['nome_empresa'] = 'required|string|max:255';
            $rules['nome_responsavel'] = 'nullable|string|max:255';
            $rules['nuit'] = 'required|string|unique:corretoras,nuit';
            $rules['telefone1'] = 'required|string|max:20';
            $rules['telefone2'] = 'nullable|string|max:20';
            $rules['endereco'] = 'nullable|string|max:255';
        }

        if ($this->perfil === 'cliente') {
            $rules['tipo_cliente'] = 'required|in:fisica,juridica';
            $rules['nome_completo'] = 'required|string|max:255';
            $rules['nuit'] = 'required|string|unique:clientes,nuit';
            $rules['documento'] = 'nullable|string|max:50';
            $rules['endereco'] = 'nullable|string|max:255';
            $rules['telefone1'] = 'required|string|max:20';
            $rules['telefone2'] = 'nullable|string|max:20';

            if ($this->tipo_cliente === 'juridica') {
                $rules['tipo_empresa'] = 'required|string|max:100';
                $rules['upload_nuit'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120'; // 5MB
                $rules['upload_doc_representante'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
                $rules['upload_certidao_comercial'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
                $rules['upload_licenca'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
                $rules['upload_br'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Este email já está em uso',
            'password.confirmed' => 'As senhas não coincidem',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres',
            'nuit.unique' => 'Este NUIT já está registado',
            'perfil.in' => 'Perfil inválido',
        ];
    }
}
