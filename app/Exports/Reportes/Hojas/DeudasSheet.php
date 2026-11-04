<?php

namespace App\Exports\Reportes\Hojas;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class DeudasSheet implements FromArray, WithHeadings, WithTitle, ShouldAutoSize
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
}