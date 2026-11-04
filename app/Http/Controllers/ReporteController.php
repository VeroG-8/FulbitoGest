<?php

namespace App\Http\Controllers;

use App\Services\ReporteService;
use App\Exports\Reportes\ReporteExport;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;

class ReporteController extends Controller
{
    protected ReporteService $reporteService;

    public function __construct(ReporteService $reporteService)
    {
        $this->reporteService = $reporteService;
    }

    public function index()
    {
        // Obtener todos los datos mediante el servicio
        $datos = $this->reporteService->obtenerDatos();

        // Enviar los datos a React
        return Inertia::render('Reportes/Index', $datos);
    }

    public function exportar()
    {
        // Obtener los mismos datos que utiliza la pantalla
        $datos = $this->reporteService->obtenerDatos();

        // Generar y descargar el archivo Excel
        return Excel::download(
            new ReporteExport($datos),
            'reportes-fulbitogest.xlsx'
        );
    }
}
