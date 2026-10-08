<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tutor extends Model
{
    protected $table = 'tutores';

    protected $fillable = [
        'dni',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'direccion',
        'localidad',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function jugadores(): BelongsToMany
    {
        return $this->belongsToMany(
            Jugador::class,
            'jugador_tutor'
        )->withPivot(
            'parentesco',
            'es_tutor_principal'
        )->withTimestamps();
    }
}