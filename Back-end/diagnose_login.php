<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Login Diagnostic ---\n";

$email = 'admin@segurostm.com';
$password = 'password';

$user = User::where('email', $email)->first();

if (!$user) {
    echo "ERROR: User with email '$email' NOT FOUND in database.\n";
    exit(1);
}

echo "User Found: ID {$user->id}, Name: {$user->name}, Role: {$user->role}, Status: {$user->status}\n";
echo "Current Password Hash: " . substr($user->password, 0, 10) . "...\n";

// Test Hash::check
if (Hash::check($password, $user->password)) {
    echo "SUCCESS: Hash::check('password', hash) returned TRUE.\n";
} else {
    echo "FAILURE: Hash::check('password', hash) returned FALSE.\n";
    
    // Attempt fix
    echo "Attempting to reset password...\n";
    // With 'hashed' cast, we assign plain text
    $user->password = $password; 
    $user->save();
    
    echo "Password reset. Retesting...\n";
    if (Hash::check($password, $user->password)) {
        echo "SUCCESS: Password match after reset.\n";
    } else {
        echo "CRITICAL FAILURE: Password match failed even after reset. Check 'hashed' cast or Hashing config.\n";
    }
}

// Test manual assignment without Loop/Cast if needed (debug only)
// $user->setRawAttributes(['password' => Hash::make('password')]);
// $user->save();

echo "--- End Diagnostic ---\n";
