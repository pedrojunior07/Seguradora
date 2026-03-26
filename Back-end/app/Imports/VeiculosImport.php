<?php

namespace App\Imports;

use App\Models\Veiculo;
use App\Models\VeiculoSeguradoraSeguro;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class VeiculosImport implements ToCollection, WithHeadingRow
{
    protected $frotaId;
    protected $seguradoraSeguroId;
    protected $clienteId;
    
    public $successCount = 0;
    public $errors = [];

    public function __construct($frotaId, $seguradoraSeguroId, $clienteId)
    {
        $this->frotaId = $frotaId;
        $this->seguradoraSeguroId = $seguradoraSeguroId;
        $this->clienteId = $clienteId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; 

            // 1. Validate Row Data
            // We use the new header names provided by the user
            $validator = Validator::make($row->toArray(), [
                'matricula' => 'required|string|unique:veiculos,matricula',
                'marca' => 'required|string',
                'modelo' => 'required|string',
                'ano_fabricacao' => 'required|integer|min:1900|max:' . (date('Y') + 1),
                'tipo_veiculo' => 'required|string',
                'chassi' => 'required|string|unique:veiculos,chassi',
                'cor' => 'nullable|string',
                'cilindrada' => 'nullable|string',
                'combustivel' => 'nullable|string',
                'numero_lugares' => 'nullable|integer',
                'quilometragem' => 'nullable|numeric|min:0',
                'valor_base_bem' => 'required|numeric|min:0.01',
                'estado_veiculo' => 'nullable|string',
                'observacoes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                $this->errors[] = [
                    'linha' => $rowNumber,
                    'matricula' => $row['matricula'] ?? 'N/A',
                    'erros' => $validator->errors()->all(),
                ];
                continue;
            }

            // 2. Transaction for this vehicle
            DB::beginTransaction();
            try {
                // Create Vehicle mapping user headers to DB columns
                $veiculo = Veiculo::create([
                    'id_cliente' => $this->clienteId,
                    'marca' => $row['marca'],
                    'modelo' => $row['modelo'],
                    'ano_fabrico' => $row['ano_fabricacao'],
                    'matricula' => $row['matricula'],
                    'chassi' => $row['chassi'],
                    'valor_estimado' => $row['valor_base_bem'],
                    'tipo_veiculo' => $row['tipo_veiculo'],
                    'cor' => $row['cor'] ?? null,
                    'cilindrada' => $row['cilindrada'] ?? null,
                    'combustivel' => $row['combustivel'] ?? null,
                    'numero_lugares' => $row['numero_lugares'] ?? null,
                    'quilometragem_registrada' => $row['quilometragem'] ?? 0,
                    'estado_veiculo' => $row['estado_veiculo'] ?? null,
                    'observacoes' => $row['observacoes'] ?? null,
                ]);

                // Associate with Frota
                $veiculo->frotas()->attach($this->frotaId);

                // Associate with Insurance (SeguradoraSeguro) - Only if ID is provided
                if ($this->seguradoraSeguroId) {
                    VeiculoSeguradoraSeguro::create([
                        'veiculo_id' => $veiculo->id_veiculo,
                        'seguradora_seguro_id' => $this->seguradoraSeguroId,
                        'estado' => 'pendente', 
                        'data_associacao' => now(),
                    ]);
                }

                DB::commit();
                $this->successCount++;

            } catch (\Exception $e) {
                DB::rollBack();
                $this->errors[] = [
                    'linha' => $rowNumber,
                    'matricula' => $row['matricula'] ?? 'N/A',
                    'erros' => ['Erro interno: ' . $e->getMessage()],
                ];
            }
        }
    }
}
