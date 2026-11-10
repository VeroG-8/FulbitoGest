<?php

namespace App\Http\Controllers;

use App\Services\ReporteService;
use App\Exports\Reportes\ReporteExport;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    protected ReporteService $reporteService;

    public function __construct(ReporteService $reporteService)
    {
        $this->reporteService = $reporteService;
    }

    public function index(Request $request)
    {
        $request->validate([
            'anio' => ['nullable', 'integer', 'between:2020,2100'],
        ]);

        $anio = (int) $request->input('anio', now()->year);

        $datos = $this->reporteService->obtenerDatos($anio);

        return Inertia::render('Reportes/Index', $datos);
    }

    public function exportar(Request $request)
    {
        $request->validate([
            'anio' => ['nullable', 'integer', 'between:2020,2100'],
        ]);

        $anio = (int) $request->input('anio', now()->year);

        $datos = $this->reporteService->obtenerDatos($anio);

        return Excel::download(
            new ReporteExport($datos),
            "reportes-fulbitogest-{$anio}.xlsx"
        );
    }
}