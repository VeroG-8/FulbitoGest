<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Torneo extends Model
{
    protected $table = 'torneos';

    protected $fillable = [
        'nombre',
        'organizador',
        'fecha_inicio',
        'fecha_fin',
        'lugar',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'estado' => 'boolean',
    ];

    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(
            Categoria::class,
            'torneo_categoria'
        )->withTimestamps();
    }

    public function jugadores(): BelongsToMany
    {
        return $this->belongsToMany(
            Jugador::class,
            'inscripciones_torneo'
        )->withPivot(
            'fecha_inscripcion',
            'estado'
        )->withTimestamps();
    }
    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class);
    }
}