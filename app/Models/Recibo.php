<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Recibo extends Model
{
    protected $table = 'recibos';

    protected $fillable = [
        'numero',
        'pago_type',
        'pago_id',
    ];

    public function pago(): MorphTo
    {
        return $this->morphTo(
            'pago',
            'pago_type',
            'pago_id'
        );
    }
}
