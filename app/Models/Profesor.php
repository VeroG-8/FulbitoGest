<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Profesor extends Model
{
    protected $table = 'profesores';

    protected $fillable = [
        'dni',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'direccion',
        'localidad',
        'especialidad',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(
            Categoria::class,
            'profesor_categoria'
        )->withTimestamps();
    }
}