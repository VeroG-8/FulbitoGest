<?php

test('registration screen is not available', function () {
    $response = $this->get('/register');

    $response->assertNotFound();
});

test('users cannot register through the public route', function () {
    $response = $this->post('/register', [
        'name' => 'Usuario de prueba',
        'email' => 'prueba@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertNotFound();

    $this->assertDatabaseMissing('users', [
        'email' => 'prueba@example.com',
    ]);
});