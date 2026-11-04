<?php

namespace App\Exports\Reportes\Hojas;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class RecaudacionSheet implements FromArray, WithHeadings, WithTitle, ShouldAutoSize
{
    protected array $recaudacion;

    public function __construct(array $recaudacion)
    {
        $this->recaudacion = $recaudacion;
    }

    public function title(): string
    {
        return 'Recaudación mensual';
    }

    public function headings(): array
    {
        return ['Mes', 'Total recaudado'];
    }

    public function array(): array
    {
        return array_map(function ($item) {
            return [
                $item['mes'],
                $item['total'],
            ];
        }, $this->recaudacion);
    }
}