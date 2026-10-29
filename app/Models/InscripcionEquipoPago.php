<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class InscripcionEquipoPago extends Model
{
    protected $table = 'inscripcion_equipo_pagos';

    protected $fillable = [
        'equipo_torneo_id',
        'modalidad_pago_id',
        'fecha_pago',
        'monto',
        'estado',
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'monto' => 'decimal:2',
    ];

    public function inscripcionEquipo(): BelongsTo
    {
        return $this->belongsTo(
            InscripcionEquipo::class,
            'equipo_torneo_id'
        );
    }

    public function modalidadPago(): BelongsTo
    {
        return $this->belongsTo(
            ModalidadPago::class,
            'modalidad_pago_id'
        );
    }

    public function recibo(): MorphOne
    {
        return $this->morphOne(Recibo::class, 'pago');
    }
}
