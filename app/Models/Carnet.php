<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Carnet extends Model
{
    protected $table = 'carnets';

    protected $fillable = [
        'jugador_id',
        'codigo',
        'qr_token',
        'fecha_emision',
        'fecha_vencimiento',
        'estado',
    ];

    protected $casts = [
        'fecha_emision' => 'date',
        'fecha_vencimiento' => 'date',
        'estado' => 'string',
    ];

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }
    
}