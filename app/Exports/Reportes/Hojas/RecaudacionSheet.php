<?php

namespace App\Exports\Reportes\Hojas;

use App\Exports\Reportes\Estilos\EstiloReporte;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class RecaudacionSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithEvents
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
        return [
            'Mes',
            'Total recaudado',
        ];
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

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                EstiloReporte::aplicar(
                    $sheet,
                    'Recaudación mensual del período seleccionado',
                    2
                );

                $ultimaFila = $sheet->getHighestRow();

                // Formato monetario.
                if ($ultimaFila >= 5) {
                    $sheet->getStyle("B5:B{$ultimaFila}")
                        ->getNumberFormat()
                        ->setFormatCode('"$" #,##0.00');
                }

                // Alineación de importes.
                $sheet->getStyle("B5:B{$ultimaFila}")
                    ->getAlignment()
                    ->setHorizontal('right');
            },
        ];
    }
}
