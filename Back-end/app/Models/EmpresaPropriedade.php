<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpresaPropriedade extends Model
{
    protected $table = 'empresa_propriedade';
    protected $primaryKey = 'id_propriet';

    protected $fillable = [
        'id_categoria',
        'numero_compartimentos',
        'valor_estimado',
        'upload_fotos',
        'upload_documentos'
    ];
}
