<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipo extends Model
{
    protected $table = 'equipos';

    protected $fillable = [
        'club_id',
        'categoria_id',
        'nombre',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function partidosComoLocal(): HasMany
    {
        return $this->hasMany(
            Partido::class,
            'equipo_local_id'
        );
    }

    public function partidosComoVisitante(): HasMany
    {
        return $this->hasMany(
            Partido::class,
            'equipo_visitante_id'
        );
    }
    /**
     * Torneos en los que participa el equipo.
     */
    public function torneos(): BelongsToMany
    {
        return $this->belongsToMany(Torneo::class, 'equipo_torneo')
            ->withPivot('fecha_inscripcion', 'estado')
            ->withTimestamps();
    }
}