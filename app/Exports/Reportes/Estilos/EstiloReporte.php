<?php

namespace App\Exports\Reportes\Estilos;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class EstiloReporte
{
    /**
     * Aplica el diseño general del reporte.
     */
    public static function aplicar(Worksheet $sheet, string $titulo, int $ultimaColumna): void
    {
        $ultimaColumnaLetra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($ultimaColumna);

        // Insertar espacio para el título y subtítulo.
        $sheet->insertNewRowBefore(1, 3);

        // Título principal.
        $sheet->mergeCells("A1:{$ultimaColumnaLetra}1");
        $sheet->setCellValue('A1', 'FULBITOGEST | REPORTES Y ESTADÍSTICAS');

        $sheet->getStyle("A1:{$ultimaColumnaLetra}1")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0F172A'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(34);

        // Subtítulo.
        $sheet->mergeCells("A2:{$ultimaColumnaLetra}2");
        $sheet->setCellValue('A2', $titulo);

        $sheet->getStyle("A2:{$ultimaColumnaLetra}2")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => '334155'],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getRowDimension(2)->setRowHeight(25);

        // Encabezados de la tabla (fila 4).
        $ultimaFila = $sheet->getHighestRow();

        $sheet->getStyle("A4:{$ultimaColumnaLetra}4")->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 10,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E40AF'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
        ]);

        $sheet->getRowDimension(4)->setRowHeight(30);

        // Filas de datos.
        if ($ultimaFila > 4) {
            $sheet->getStyle("A5:{$ultimaColumnaLetra}{$ultimaFila}")->applyFromArray([
                'font' => [
                    'size' => 10,
                    'color' => ['rgb' => '334155'],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'bottom' => [
                        'borderStyle' => Border::BORDER_HAIR,
                        'color' => ['rgb' => 'E2E8F0'],
                    ],
                ],
            ]);

            // Filas alternadas.
            for ($fila = 5; $fila <= $ultimaFila; $fila++) {
                if ($fila % 2 === 0) {
                    $sheet->getStyle("A{$fila}:{$ultimaColumnaLetra}{$fila}")
                        ->getFill()
                        ->setFillType(Fill::FILL_SOLID);

                    $sheet->getStyle("A{$fila}:{$ultimaColumnaLetra}{$fila}")
                        ->getFill()
                        ->getStartColor()
                        ->setRGB('F1F5F9');
                }
            }

            // Altura de filas.
            for ($fila = 5; $fila <= $ultimaFila; $fila++) {
                $sheet->getRowDimension($fila)->setRowHeight(22);
            }
        }

        // Filtro automático.
        if ($ultimaFila >= 4) {
            $sheet->setAutoFilter("A4:{$ultimaColumnaLetra}{$ultimaFila}");
        }

        // Congelar encabezados.
        $sheet->freezePane('A5');
    }
}