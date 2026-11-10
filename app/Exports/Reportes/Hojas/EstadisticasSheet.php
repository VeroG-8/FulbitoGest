<?php

namespace App\Exports\Reportes\Hojas;

use App\Exports\Reportes\Estilos\EstiloReporte;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class EstadisticasSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithEvents
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
        return [
            'Indicador',
            'Valor',
        ];
    }

    public function array(): array
    {
        return [
            ['Año del reporte', $this->estadisticas['anioSeleccionado']],
            ['Jugadores activos', $this->estadisticas['jugadoresActivos']],
            ['Categorías activas', $this->estadisticas['categoriasActivas']],
            [
                'Recaudación anual de cuotas mensuales',
                $this->estadisticas['recaudacionCuotasMensuales'],
            ],
            [
                'Deuda anual de cuotas mensuales',
                $this->estadisticas['deudaCuotasMensuales'],
            ],
            [
                'Recaudación anual de inscripciones a la escuelita',
                $this->estadisticas['recaudacionInscripcionesEscuelita'],
            ],
            [
                'Deuda anual de inscripciones a la escuelita',
                $this->estadisticas['deudaInscripcionesEscuelita'],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                EstiloReporte::aplicar(
                    $sheet,
                    'Resumen general de indicadores',
                    2
                );

                // Formato monetario para los indicadores económicos.
                $sheet->getStyle('B8:B11')
                    ->getNumberFormat()
                    ->setFormatCode('"$" #,##0.00');

                $sheet->getStyle('B8:B11')
                    ->getAlignment()
                    ->setHorizontal('right');
            },
        ];
    }
}
