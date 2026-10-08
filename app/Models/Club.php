<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Club extends Model
{
    protected $table = 'clubes';

    protected $fillable = [
        'nombre',
        'localidad',
        'direccion',
        'telefono',
        'email',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class);
    }
    
    public function pasesOrigen(): HasMany
    {
        return $this->hasMany(
            Pase::class,
            'club_origen_id'
        );
    }

    public function pasesDestino(): HasMany
    {
        return $this->hasMany(
            Pase::class,
            'club_destino_id'
        );
    }
    
}