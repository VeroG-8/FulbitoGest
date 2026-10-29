<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InscripcionTorneo extends Model
{
    protected $table = 'inscripciones_torneo';

    protected $fillable = [
        'jugador_id',
        'torneo_id',
        'fecha_inscripcion',
        'monto_inscripcion',
        'estado',
    ];

    protected $casts = [
        'fecha_inscripcion' => 'date',
        'monto_inscripcion' => 'decimal:2',
    ];

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class);
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(
            InscripcionTorneoPago::class,
            'inscripcion_torneo_id'
        );
    }
}
