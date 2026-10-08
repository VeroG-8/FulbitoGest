<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cuota extends Model
{
    protected $table = 'cuotas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'monto',
        'fecha_vencimiento',
        'estado',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_vencimiento' => 'date',
        'estado' => 'boolean',
    ];

    public function cuotaXJugadores(): HasMany
    {
        return $this->hasMany(CuotaXJugador::class);
    }
}
