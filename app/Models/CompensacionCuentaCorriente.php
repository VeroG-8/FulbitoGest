<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompensacionCuentaCorriente extends Model
{
    protected $table = 'compensaciones_cuenta_corriente';

    protected $fillable = [
        'jugador_id',
        'movimiento_debito_id',
        'movimiento_credito_id',
        'reversion_de_id',
        'tipo',
        'monto',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function movimientoDebito(): BelongsTo
    {
        return $this->belongsTo(MovimientoCuentaCorriente::class, 'movimiento_debito_id');
    }

    public function movimientoCredito(): BelongsTo
    {
        return $this->belongsTo(MovimientoCuentaCorriente::class, 'movimiento_credito_id');
    }

    public function reversionDe(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reversion_de_id');
    }

    public function reversiones(): HasMany
    {
        return $this->hasMany(self::class, 'reversion_de_id');
    }
}