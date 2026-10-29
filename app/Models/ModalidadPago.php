<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModalidadPago extends Model
{
    protected $table = 'modalidades_pago';

    protected $fillable = [
        'nombre',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class);
    }
    
    public function pagosInscripcionTorneo(): HasMany
    {
        return $this->hasMany(InscripcionTorneoPago::class, 'modalidad_pago_id');
    }
}