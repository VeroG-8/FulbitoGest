<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Categoria extends Model
{
    protected $table = 'categorias';

    protected $fillable = [
        'nombre',
        'anio',
        'estado',
    ];

    protected $casts = [
        'anio' => 'integer',
        'estado' => 'boolean',
    ];

    public function jugadores(): HasMany
    {
        return $this->hasMany(Jugador::class);
    }

    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class);
    }
    
    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class);
    }

    public function profesores(): BelongsToMany
    {
        return $this->belongsToMany(
            Profesor::class,
            'profesor_categoria'
        )->withTimestamps();
    }

    public function torneos(): BelongsToMany
    {
        return $this->belongsToMany(
            Torneo::class,
            'torneo_categoria'
        )->withTimestamps();
    }
}