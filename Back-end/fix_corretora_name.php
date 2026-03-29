<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Corretora;

$c = Corretora::where('nome', 'indico Seguros')->first();
if($c) {
    $c->nome = 'Corretora de Seguros';
    $c->save();
    echo "Nome alterado para Corretora de Seguros\n";
} else {
    echo "Corretora 'indico Seguros' não encontrada.\n";
}
