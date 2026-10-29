<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InscripcionEquipo extends Model
{
    protected $table = 'equipo_torneo';

    protected $fillable = [
        'equipo_id',
        'torneo_id',
        'fecha_inscripcion',
        'monto_inscripcion',
        'estado',
    ];

    protected $casts = [
        'fecha_inscripcion' => 'date',
        'monto_inscripcion' => 'decimal:2',
        'estado' => 'boolean',
    ];

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class);
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(
            InscripcionEquipoPago::class,
            'equipo_torneo_id'
        );
    }
}