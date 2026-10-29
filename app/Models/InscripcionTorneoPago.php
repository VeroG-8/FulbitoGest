<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InscripcionTorneoPago extends Model
{
    protected $table = 'inscripcion_torneo_pagos';

    protected $fillable = [
        'inscripcion_torneo_id',
        'modalidad_pago_id',
        'fecha_pago',
        'monto',
        'estado',
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'monto' => 'decimal:2',
    ];

    public function inscripcionTorneo(): BelongsTo
    {
        return $this->belongsTo(
            InscripcionTorneo::class,
            'inscripcion_torneo_id'
        );
    }

    public function modalidadPago(): BelongsTo
    {
        return $this->belongsTo(
            ModalidadPago::class,
            'modalidad_pago_id'
        );
    }
    
    public function recibo(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(
            Recibo::class,
            'pago',
            'pago_type',
            'pago_id'
        );
    }

}
