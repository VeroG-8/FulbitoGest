<?php

namespace App\Exports\Reportes\Hojas;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class CategoriasSheet implements FromArray, WithHeadings, WithTitle, ShouldAutoSize
{
    protected array $categorias;

    public function __construct(array $categorias)
    {
        $this->categorias = $categorias;
    }

    public function title(): string
    {
        return 'Categorías';
    }

    public function headings(): array
    {
        return [
            'Categoría',
            'Año',
            'Jugadores activos',
            'Total recaudado',
            'Deuda pendiente',
        ];
    }

    public function array(): array
    {
        return array_map(function ($item) {
            return [
                $item['categoria'],
                $item['anio'],
                $item['jugadoresActivos'],
                $item['totalRecaudado'],
                $item['deudaPendiente'],
            ];
        }, $this->categorias);
    }
}