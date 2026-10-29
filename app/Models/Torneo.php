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
        'tipo',
        'monto_inscripcion',
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
        'monto_inscripcion' => 'decimal:2',
    ];

    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(
            Categoria::class,
            'torneo_categoria'
        )
        ->withPivot('monto_inscripcion','monto_por_jugador')
        ->withTimestamps();
    }


    public function jugadores(): BelongsToMany
    {
        return $this->belongsToMany(
            Jugador::class,
            'inscripciones_torneo'
        )->withPivot(
            'id',
            'fecha_inscripcion',
            'monto_inscripcion',
            'estado'
        )->withTimestamps();
    }

    
    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class);
    }

    /**
     * Equipos inscriptos en el torneo.
     */
  
    public function equipos(): BelongsToMany
    {
        return $this->belongsToMany(Equipo::class, 'equipo_torneo')
            ->withPivot('id', 'fecha_inscripcion', 'monto_inscripcion', 'estado')
            ->withTimestamps();
    }

}