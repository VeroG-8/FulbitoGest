<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partido extends Model
{
    protected $table = 'partidos';

    protected $fillable = [
        'torneo_id',
        'equipo_local_id',
        'equipo_visitante_id',
        'fecha',
        'hora',
        'lugar',
        'goles_local',
        'goles_visitante',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'goles_local' => 'integer',
        'goles_visitante' => 'integer',
    ];

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class);
    }

    public function equipoLocal(): BelongsTo
    {
        return $this->belongsTo(
            Equipo::class,
            'equipo_local_id'
        );
    }

    public function equipoVisitante(): BelongsTo
    {
        return $this->belongsTo(
            Equipo::class,
            'equipo_visitante_id'
        );
    }
}