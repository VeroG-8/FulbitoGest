<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AplicacionCredito extends Model
{
    protected $table = 'aplicaciones_credito';

    protected $fillable = [
        'jugador_id',
        'movimiento_credito_id',
        'cuota_x_jugador_id',
        'reversion_de_id',
        'tipo',
        'monto',
        'user_id',
        'observacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function movimientoCredito(): BelongsTo
    {
        return $this->belongsTo(
            MovimientoCuentaCorriente::class,
            'movimiento_credito_id'
        );
    }

    public function asignacion(): BelongsTo
    {
        return $this->belongsTo(
            CuotaXJugador::class,
            'cuota_x_jugador_id'
        );
    }

    public function reversionDe(): BelongsTo
    {
        return $this->belongsTo(
            self::class,
            'reversion_de_id'
        );
    }

    public function reversiones(): HasMany
    {
        return $this->hasMany(
            self::class,
            'reversion_de_id'
        );
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}