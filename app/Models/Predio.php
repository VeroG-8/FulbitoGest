<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Predio extends Model
{
    protected $table = 'predios';

    protected $fillable = [
        'nombre',
        'direccion',
        'localidad',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function canchas(): HasMany
    {
        return $this->hasMany(Cancha::class);
    }
}