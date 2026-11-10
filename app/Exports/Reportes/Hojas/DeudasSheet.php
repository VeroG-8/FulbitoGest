<?php

namespace App\Exports\Reportes\Hojas;

use App\Exports\Reportes\Estilos\EstiloReporte;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class DeudasSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithEvents
{
    protected array $deudas;

    public function __construct(array $deudas)
    {
        $this->deudas = $deudas;
    }

    public function title(): string
    {
        return 'Detalle de deudas';
    }

    public function headings(): array
    {
        return [
            'ID jugador',
            'Jugador',
            'Estado jugador',
            'Categoría',
            'Concepto',
            'Cuota',
            'Monto cuota',
            'Total pagado',
            'Saldo pendiente',
            'Fecha vencimiento',
            'Estado vencimiento',
        ];
    }

    public function array(): array
    {
        return array_map(function ($item) {
            return [
                $item['jugadorId'],
                $item['jugador'],
                $item['estadoJugador'],
                $item['categoria'],
                $item['concepto'],
                $item['cuota'],
                $item['montoCuota'],
                $item['totalPagado'],
                $item['saldoPendiente'],
                $item['fechaVencimiento']
                    ? $item['fechaVencimiento']->format('d/m/Y')
                    : 'Sin vencimiento',
                $item['estadoVencimiento'],
            ];
        }, $this->deudas);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                EstiloReporte::aplicar(
                    $sheet,
                    'Detalle de cuotas con saldo pendiente',
                    11
                );

                $ultimaFila = $sheet->getHighestRow();

                // Formato monetario.
                if ($ultimaFila >= 5) {
                    $sheet->getStyle("G5:I{$ultimaFila}")
                        ->getNumberFormat()
                        ->setFormatCode('"$" #,##0.00');

                    $sheet->getStyle("G5:I{$ultimaFila}")
                        ->getAlignment()
                        ->setHorizontal('right');
                }

                // Ajustar la presentación de las columnas de texto.
                $sheet->getColumnDimension('B')->setWidth(28);
                $sheet->getColumnDimension('E')->setWidth(30);
                $sheet->getColumnDimension('F')->setWidth(25);
                $sheet->getColumnDimension('K')->setWidth(22);
            },
        ];
    }
}