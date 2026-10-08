<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    protected $table = 'pagos';

    protected $fillable = [
        'cuota_x_jugador_id',
        'modalidad_pago_id',
        'fecha_pago',
        'monto',
        'comprobante',
        'estado',
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'monto' => 'decimal:2',
    ];

    public function cuotaXJugador(): BelongsTo
    {
        return $this->belongsTo(CuotaXJugador::class);
    }

    public function modalidadPago(): BelongsTo
    {
        return $this->belongsTo(ModalidadPago::class);
    }
}