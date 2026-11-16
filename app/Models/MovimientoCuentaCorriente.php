<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MovimientoCuentaCorriente extends Model
{
    protected $table = 'movimientos_cuenta_corriente';

    protected $fillable = [
        'jugador_id',
        'cuota_x_jugador_id',
        'historial_modificacion_cuota_id',
        'movimiento_origen_id',
        'user_id',
        'tipo',
        'monto',
        'descripcion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function asignacion(): BelongsTo
    {
        return $this->belongsTo(
            CuotaXJugador::class,
            'cuota_x_jugador_id'
        );
    }

    public function historialModificacion(): BelongsTo
    {
        return $this->belongsTo(
            HistorialModificacionCuota::class,
            'historial_modificacion_cuota_id'
        );
    }

    public function movimientoOrigen(): BelongsTo
    {
        return $this->belongsTo(
            self::class,
            'movimiento_origen_id'
        );
    }

    public function movimientosDerivados(): HasMany
    {
        return $this->hasMany(
            self::class,
            'movimiento_origen_id'
        );
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function aplicaciones(): HasMany
    {
        return $this->hasMany(
            AplicacionCredito::class,
            'movimiento_credito_id'
        );
    }
}