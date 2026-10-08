<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CuotaXJugador extends Model
{
    protected $table = 'cuota_x_jugador';

    protected $fillable = [
        'cuota_id',
        'jugador_id',
        'fecha_asignacion',
        'fecha_vencimiento',
        'estado',
    ];

    protected $casts = [
        'fecha_asignacion' => 'date',
        'fecha_vencimiento' => 'date',
    ];

    public function cuota(): BelongsTo
    {
        return $this->belongsTo(Cuota::class);
    }

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class);
    }
}