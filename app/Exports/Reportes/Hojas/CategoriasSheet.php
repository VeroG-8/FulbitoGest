<?php

namespace App\Exports\Reportes\Hojas;

use App\Exports\Reportes\Estilos\EstiloReporte;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class CategoriasSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithEvents
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

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                EstiloReporte::aplicar(
                    $sheet,
                    'Resumen económico y deportivo por categoría',
                    5
                );

                $ultimaFila = $sheet->getHighestRow();

                // Formato monetario para recaudación y deuda.
                if ($ultimaFila >= 5) {
                    $sheet->getStyle("D5:E{$ultimaFila}")
                        ->getNumberFormat()
                        ->setFormatCode('"$" #,##0.00');

                    $sheet->getStyle("D5:E{$ultimaFila}")
                        ->getAlignment()
                        ->setHorizontal('right');
                }
            },
        ];
    }
}
