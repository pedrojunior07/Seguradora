<?php

use App\Models\User;
use App\Models\Seguradora;
use Illuminate\Support\Facades\Hash;
use App\Services\AuthService;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Verification: Block Insurer Logic ---\n";

// 1. Setup Test Data
$testEmail = 'test_block_logic@example.com';
$testNif = '999999999';

// Cleanup prev run
User::where('email', $testEmail)->delete();
Seguradora::where('email', $testEmail)->delete();

echo "Creating Test Seguradora and User...\n";

$seguradora = Seguradora::create([
    'nome' => 'Test Seguradora',
    'nuit' => $testNif,
    'telefone1' => '123456789',
    'email' => $testEmail,
    'status' => true
]);

$user = User::create([
    'name' => 'Test User',
    'email' => $testEmail,
    'password' => Hash::make('password'),
    'perfil' => 'seguradora',
    'perfil_id' => $seguradora->id_seguradora,
    'seguradora_id' => $seguradora->id_seguradora,
    'status' => true,
    'role' => 'user'
]);
$user->markEmailAsVerified(); // Ensure email verify doesn't block us

$authService = $app->make(AuthService::class);

// 2. Test Login (Active)
echo "\nTest 1: Login with Active Seguradora... ";
try {
    $result = $authService->login($testEmail, 'password');
    if ($result) {
        echo "SUCCESS (Logged in)\n";
    } else {
        echo "FAILURE (Credentials rejected)\n";
    }
} catch (\Exception $e) {
    echo "FAILURE (Exception: " . $e->getMessage() . ")\n";
}

// 3. Block Seguradora
echo "\nBlocking Seguradora (setting status = false)...\n";
$seguradora->status = false;
$seguradora->save();

// 4. Test Login (Blocked)
echo "Test 2: Login with Blocked Seguradora... ";
try {
    $result = $authService->login($testEmail, 'password');
    echo "FAILURE (Should have thrown exception)\n";
} catch (\Exception $e) {
    echo "SUCCESS (Blocked: " . $e->getMessage() . ")\n";
}

// 5. Unblock
echo "\nUnblocking Seguradora (setting status = true)...\n";
$seguradora->status = true;
$seguradora->save();

// 6. Test Login (Unblocked)
echo "Test 3: Login with Unblocked Seguradora... ";
try {
    $result = $authService->login($testEmail, 'password');
    if ($result) {
        echo "SUCCESS (Logged in)\n";
    } else {
        echo "FAILURE (Credentials rejected)\n";
    }
} catch (\Exception $e) {
    echo "FAILURE (Exception: " . $e->getMessage() . ")\n";
}

// Cleanup
$user->delete();
$seguradora->delete();
echo "\n--- Verification Complete ---\n";
