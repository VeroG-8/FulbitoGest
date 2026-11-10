<?php

namespace App\Http\Controllers;

use App\Services\ReporteService;
use App\Exports\Reportes\ReporteExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    protected ReporteService $reporteService;

    public function __construct(ReporteService $reporteService)
    {
        $this->reporteService = $reporteService;
    }

    /**
     * Muestra los reportes y estadísticas.
     */
    public function index(Request $request)
    {
        $filtros = $this->validarFiltros($request);

        $datos = $this->reporteService->obtenerDatos(
            (int) ($filtros['anio'] ?? now()->year),
            $filtros['periodo'] ?? null,
            isset($filtros['categoriaId'])
                ? (int) $filtros['categoriaId']
                : null,
            $filtros['concepto'] ?? null
        );

        return Inertia::render('Reportes/Index', $datos);
    }

    /**
     * Exporta los reportes a Excel.
     */
    public function exportar(Request $request)
    {
        $filtros = $this->validarFiltros($request);

        $anio = (int) ($filtros['anio'] ?? now()->year);

        $datos = $this->reporteService->obtenerDatos(
            $anio,
            $filtros['periodo'] ?? null,
            isset($filtros['categoriaId'])
                ? (int) $filtros['categoriaId']
                : null,
            $filtros['concepto'] ?? null
        );

        return Excel::download(
            new ReporteExport($datos),
            "reportes-fulbitogest-{$anio}.xlsx"
        );
    }

    /**
     * Valida los filtros utilizados en pantalla y en Excel.
     */
    private function validarFiltros(Request $request): array
    {
        return $request->validate([
            'anio' => [
                'nullable',
                'integer',
                'between:2020,2100',
            ],
            'periodo' => [
                'nullable',
                'regex:/^\d{4}-\d{2}$/',
            ],
            'categoriaId' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'concepto' => [
                'nullable',
                'in:cuota_mensual,inscripcion_torneo,inscripcion_escuelita',
            ],
        ]);
    }
        public function exportarPdf(Request $request)
    {
        $filtros = $this->validarFiltros($request);

        $anio = (int) ($filtros['anio'] ?? now()->year);

        $datos = $this->reporteService->obtenerDatos(
            $anio,
            $filtros['periodo'] ?? null,
            isset($filtros['categoriaId'])
                ? (int) $filtros['categoriaId']
                : null,
            $filtros['concepto'] ?? null
        );

        $pdf = Pdf::loadView('reportes.pdf', $datos)
            ->setPaper('a4', 'landscape');

        return $pdf->download(
            "reportes-fulbitogest-{$anio}.pdf"
        );
    }
}