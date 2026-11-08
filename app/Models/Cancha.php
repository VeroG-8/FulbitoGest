<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cancha extends Model
{
    protected $table = 'canchas';

    protected $fillable = [
        'predio_id',
        'nombre',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function predio(): BelongsTo
    {
        return $this->belongsTo(Predio::class);
    }

    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class);
    }
}