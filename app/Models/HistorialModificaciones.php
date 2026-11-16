<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HistorialModificacionCuota extends Model
{
    protected $table = 'historial_modificaciones_cuotas';

    protected $fillable = [
        'cuota_id',
        'cuota_nombre',
        'monto_anterior',
        'monto_nuevo',
        'diferencia',
        'user_id',
        'observacion',
    ];

    protected $casts = [
        'monto_anterior' => 'decimal:2',
        'monto_nuevo' => 'decimal:2',
        'diferencia' => 'decimal:2',
    ];

    public function cuota(): BelongsTo
    {
        return $this->belongsTo(Cuota::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(
            MovimientoCuentaCorriente::class,
            'historial_modificacion_cuota_id'
        );
    }
}