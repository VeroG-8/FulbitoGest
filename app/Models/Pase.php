<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pase extends Model
{
    protected $table = 'pases';

    protected $fillable = [
        'jugador_id',
        'club_origen_id',
        'club_destino_id',
        'tipo',
        'fecha_inicio',
        'fecha_fin',
        'observaciones',
        'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'estado' => 'boolean',
    ];

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function clubOrigen(): BelongsTo
    {
        return $this->belongsTo(
            Club::class,
            'club_origen_id'
        );
    }

    public function clubDestino(): BelongsTo
    {
        return $this->belongsTo(
            Club::class,
            'club_destino_id'
        );
    }
}
