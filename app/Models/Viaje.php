<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Viaje extends Model
{
    protected $table = 'viajes';

    protected $fillable = [
        'nombre',
        'destino',
        'fecha_salida',
        'fecha_regreso',
        'medio_transporte',
        'costo',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'fecha_salida' => 'date',
        'fecha_regreso' => 'date',
        'costo' => 'decimal:2',
        'estado' => 'boolean',
    ];

    public function jugadores(): BelongsToMany
    {
        return $this->belongsToMany(
            Jugador::class,
            'jugador_x_viaje'
        )->withPivot('estado')->withTimestamps();
    }
}