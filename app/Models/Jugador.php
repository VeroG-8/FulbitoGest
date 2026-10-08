<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jugador extends Model
{
    protected $table = 'jugadores';

    protected $fillable = [
        'dni',
        'nombre',
        'apellido',
        'nacionalidad',
        'fecha_nacimiento',
        'telefono',
        'direccion',
        'localidad',
        'categoria_id',
        'estado',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'estado' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function tutores(): BelongsToMany
    {
        return $this->belongsToMany(
            Tutor::class,
            'jugador_tutor'
        )->withPivot(
            'parentesco',
            'es_tutor_principal'
        )->withTimestamps();
    }

    public function carnets(): HasMany
    {
        return $this->hasMany(Carnet::class);
    }

    public function cuotaXJugadores(): HasMany
    {
        return $this->hasMany(CuotaXJugador::class);
    }

    public function viajes(): BelongsToMany
    {
        return $this->belongsToMany(
            Viaje::class,
            'jugador_x_viaje'
        )->withPivot('estado')->withTimestamps();
    }

    public function pases(): HasMany
    {
        return $this->hasMany(Pase::class);
    }
    
    public function torneos(): BelongsToMany
{
    return $this->belongsToMany(
        Torneo::class,
        'inscripciones_torneo'
    )->withPivot(
        'fecha_inscripcion',
        'estado'
    )->withTimestamps();
}
}