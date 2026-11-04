<?php

namespace App\Exports\Reportes;

use App\Exports\Reportes\Hojas\EstadisticasSheet;
use App\Exports\Reportes\Hojas\RecaudacionSheet;
use App\Exports\Reportes\Hojas\CategoriasSheet;
use App\Exports\Reportes\Hojas\DeudasSheet;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ReporteExport implements Export, WithMultipleSheets
{
    protected array $datos;

    public function __construct(array $datos)
    {
        $this->datos = $datos;
    }

    public function sheets(): array
    {
        return [
            new EstadisticasSheet($this->datos['estadisticas']),
            new RecaudacionSheet($this->datos['recaudacionMensual']),
            new CategoriasSheet($this->datos['reportesPorCategoria']),
            new DeudasSheet($this->datos['detalleDeudas']),
        ];
    }
}