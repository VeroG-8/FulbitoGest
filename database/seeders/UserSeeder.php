<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@fulbitogest.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('Admin1234'),
                'rol' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'profesor@fulbitogest.com'],
            [
                'name' => 'Profesor',
                'password' => Hash::make('Profesor1234'),
                'rol' => 'profesor',
            ]
        );

        User::updateOrCreate(
            ['email' => 'tutor@fulbitogest.com'],
            [
                'name' => 'Tutor',
                'password' => Hash::make('Tutor1234'),
                'rol' => 'tutor',
            ]
        );
    }
}