<?php

namespace App\Exports\Reportes\Hojas;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use App\Exports\Reportes\Estilos\EstiloReporte;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class EstadisticasSheet implements FromArray, WithHeadings, WithTitle, ShouldAutoSize, WithEvents
{
    protected array $estadisticas;

    public function __construct(array $estadisticas)
    {
        $this->estadisticas = $estadisticas;
    }

    public function title(): string
    {
        return 'Estadísticas';
    }

    public function headings(): array
    {
        return ['Indicador', 'Valor'];
    }

    public function array(): array
    {
        return [
            ['Jugadores activos', $this->estadisticas['jugadoresActivos']],
            ['Categorías activas', $this->estadisticas['categoriasActivas']],
            ['Cuotas pagadas', $this->estadisticas['cuotasPagadas']],
            ['Cuotas pendientes', $this->estadisticas['cuotasPendientes']],
            ['Cuotas vencidas', $this->estadisticas['cuotasVencidas']],
            ['Deuda vencida total', $this->estadisticas['deudaVencidaTotal']],
            ['Total recaudado', $this->estadisticas['totalRecaudado']],
        ];
    }
        public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                EstiloReporte::aplicar(
                    $event->sheet->getDelegate(),
                    'Resumen general de indicadores',
                    2
                );
            },
        ];
    }
}