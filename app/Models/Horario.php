<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Horario extends Model
{
    protected $table = 'horarios';

    protected $fillable = [
        'categoria_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'lugar',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }
}