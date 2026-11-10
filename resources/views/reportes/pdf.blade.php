<!DOCTYPE html>
@php
    $rutaEscudo = public_path('images/escudo-changuitos.jpeg');

    $escudoBase64 = file_exists($rutaEscudo)
        ? 'data:image/jpeg;base64,' . base64_encode(file_get_contents($rutaEscudo))
        : null;

    $rutaLogoApp = public_path('images/Logo-FulbitoGest.png');

    $logoAppBase64 = file_exists($rutaLogoApp)
        ? 'data:image/png;base64,' . base64_encode(file_get_contents($rutaLogoApp))
        : null;

    $formatearMoneda = function ($valor) {
        return '$ ' . number_format((float) ($valor ?? 0), 2, ',', '.');
    };

    $formatearNumero = function ($valor) {
        return number_format((float) ($valor ?? 0), 0, ',', '.');
    };

    $etiquetasEstadisticas = [
        'anioSeleccionado' => 'Año del informe',
        'jugadoresActivos' => 'Jugadores activos',
        'categoriasActivas' => 'Categorías activas',
        'recaudacionCuotasMensuales' => 'Recaudación de cuotas mensuales',
        'recaudacionInscripcionesEscuelita' => 'Recaudación de inscripciones a escuelita',
        'deudaCuotasMensuales' => 'Deuda de cuotas mensuales',
        'deudaInscripcionesEscuelita' => 'Deuda de inscripciones a escuelita',
        'cuotasVencidas' => 'Cuotas vencidas',
        'deudaVencidaTotal' => 'Deuda vencida total',
    ];

    $esImporte = function ($clave) {
        $clave = strtolower($clave);

        return str_contains($clave, 'recaudacion')
            || str_contains($clave, 'recaudado')
            || str_contains($clave, 'deuda')
            || str_contains($clave, 'monto')
            || str_contains($clave, 'pagado');
    };

    $periodoLabel = 'Sin período seleccionado';

    foreach (($periodosRecaudacion ?? []) as $periodoItem) {
        if (($periodoItem['value'] ?? null) === ($periodoRecaudacionSeleccionado ?? null)) {
            $periodoLabel = $periodoItem['label'];
            break;
        }
    }

    $categoriaLabel = 'Todas las categorías';

    foreach (($categoriasRecaudacion ?? []) as $categoriaItem) {
        if (
            (int) ($categoriaItem['id'] ?? 0) === (int) ($filtrosRecaudacion['categoriaId'] ?? 0)
            && !empty($filtrosRecaudacion['categoriaId'])
        ) {
            $categoriaLabel = 'Año ' . ($categoriaItem['anio'] ?? '');
            break;
        }
    }

    $conceptos = [
        'cuota_mensual' => 'Cuota mensual',
        'inscripcion_torneo' => 'Inscripción a torneo',
        'inscripcion_escuelita' => 'Inscripción a escuelita',
    ];

    $conceptoSeleccionado = $filtrosRecaudacion['concepto'] ?? null;

    $conceptoLabel = $conceptoSeleccionado
        ? ($conceptos[$conceptoSeleccionado] ?? $conceptoSeleccionado)
        : 'Todos los conceptos';
@endphp

<html lang="es">
<head>
    <meta charset="UTF-8">

    <title>Informe de reportes - FulbitoGest</title>

    <style>
        @page {
            size: A4 landscape;
            margin: 35px 30px 45px 30px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #334155;
            line-height: 1.5;
        }

       /* ENCABEZADO */

        .header {
            width: 100%;
            border-bottom: 3px solid #16a34a;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .header-table > tbody > tr > td {
            width: 50%;
            vertical-align: middle;
            padding: 0;
        }

        /* BLOQUE DE LA ESCUELITA */

        .school-brand {
            text-align: left;
            vertical-align: middle;
        }

        .school-inner {
            width: 100%;
            border-collapse: collapse;
        }

        .school-logo-cell {
            width: 75px;
            vertical-align: middle;
            padding: 0;
        }

        .school-logo {
            width: 65px;
            height: 65px;
        }

        .school-info {
            vertical-align: middle;
            text-align: left;
            padding-left: 8px !important;
        }

        .school-info h2 {
            color: #0f172a;
            font-size: 13px;
            margin: 0;
            font-weight: bold;
        }

        .school-info p {
            color: #64748b;
            font-size: 8px;
            margin: 3px 0 0;
        }

        /* BLOQUE DE FULBITOGEST */

        .app-brand {
            text-align: right;
            vertical-align: middle;
        }

        .app-inner {
            width: 210px;
            border-collapse: collapse;
        }

        .app-logo-cell {
            width: 70px;
            vertical-align: middle;
            padding: 0;
            text-align: center;
        }

        .app-logo {
            width: 65px;
            height: 65px;
        }

        .app-name-cell {
            vertical-align: middle;
            text-align: left;
            padding-left: 6px !important;
        }

        .app-name {
            text-align: left;
        }

        .app-name strong {
            display: block;
            color: #0f172a;
            font-size: 13px;
        }

        .app-name span {
            display: block;
            color: #64748b;
            font-size: 8px;
            margin-top: 3px;
        }
        /* TÍTULO DEL DOCUMENTO */

        .document-title {
            margin-top: 17px;
        }

        .document-title h2 {
            color: #0f172a;
            font-size: 17px;
            margin: 0 0 4px;
        }

        .document-title p {
            color: #64748b;
            margin: 0;
        }

        .header-info {
            color: #64748b;
            font-size: 8px;
            margin-top: 8px;
        }

        .filters {
            margin-top: 12px;
            padding: 9px 12px;
            background-color: #f1f5f9;
            border-left: 3px solid #16a34a;
        }

        /* SECCIONES */

        .section {
            margin-top: 22px;
        }

        .section-title {
            color: #0f172a;
            font-size: 13px;
            font-weight: bold;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-bottom: 10px;
        }

        /* ESTADÍSTICAS */

        .stats-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 7px;
        }

        .stat-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            vertical-align: top;
        }

        .stat-label {
            color: #64748b;
            font-size: 8px;
            text-transform: uppercase;
        }

        .stat-value {
            color: #0f172a;
            font-size: 15px;
            font-weight: bold;
            margin-top: 5px;
        }

        .total-box {
            background-color: #ecfdf5;
            border: 1px solid #bbf7d0;
            padding: 12px;
            margin-top: 10px;
        }

        .total-box span {
            color: #166534;
            font-size: 9px;
        }

        .total-box strong {
            display: block;
            color: #14532d;
            font-size: 17px;
            margin-top: 3px;
        }

        /* TABLAS */

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        .data-table thead {
            display: table-header-group;
        }

        .data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 8px;
            text-align: left;
            padding: 8px 6px;
            border: 1px solid #0f172a;
        }

        .data-table td {
            padding: 7px 6px;
            border: 1px solid #e2e8f0;
            font-size: 8px;
        }

        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* UTILIDADES */

        .text-right {
            text-align: right !important;
        }

        .text-center {
            text-align: center !important;
        }

        .amount {
            white-space: nowrap;
        }

        .positive {
            color: #15803d;
            font-weight: bold;
        }

        .negative {
            color: #dc2626;
            font-weight: bold;
        }

        .muted {
            color: #94a3b8;
        }

        .empty {
            text-align: center;
            color: #64748b;
            padding: 16px !important;
        }

        .page-break {
            page-break-before: always;
        }

        /* PIE DE PÁGINA */

        .footer {
            position: fixed;
            bottom: -28px;
            left: 0;
            right: 0;
            border-top: 1px solid #cbd5e1;
            padding-top: 7px;
            color: #94a3b8;
            font-size: 8px;
        }

        .footer-table {
            width: 100%;
        }

        .footer-right {
            text-align: right;
        }
    </style>
</head>

<body>

{{-- ENCABEZADO INSTITUCIONAL --}}

<div class="header">

   <table class="header-table">
        <tr>

            {{-- BLOQUE IZQUIERDO: CHANGUITOS --}}

            <td class="school-brand">

                <table class="school-inner">
                    <tr>

                        <td class="school-logo-cell">
                            @if ($escudoBase64)
                                <img
                                    src="{{ $escudoBase64 }}"
                                    class="school-logo"
                                    alt="Escudo Changuitos V.S.A."
                                >
                            @endif
                        </td>

                        <td class="school-info">
                            <h2>CHANGUITOS V.S.A.</h2>
                            <p>Escuela Formativa de Fútbol Infantil</p>
                        </td>

                    </tr>
                </table>

            </td>

            {{-- BLOQUE DERECHO: FULBITOGEST --}}

            <td class="app-brand">

                <table class="app-inner" align="right">
                    <tr>

                        <td class="app-logo-cell">
                            @if ($logoAppBase64)
                                <img
                                    src="{{ $logoAppBase64 }}"
                                    class="app-logo"
                                    alt="Logo FulbitoGest"
                                >
                            @endif
                        </td>

                        <td class="app-name-cell">
                            <div class="app-name">
                                <strong>FulbitoGest</strong>
                                <span>Sistema de gestión deportiva</span>
                            </div>
                        </td>

                    </tr>
                </table>

            </td>

        </tr>
    </table>

    <div class="document-title">
        <h2>Informe económico y administrativo</h2>
        <p>Resumen de actividad, recaudación y situación de deudas.</p>
    </div>

    <div class="header-info">
        <strong>INFORME INSTITUCIONAL</strong>
        &nbsp; | &nbsp;
        Fecha de emisión: {{ now()->format('d/m/Y H:i') }} hs.
    </div>

    <div class="filters">
        <strong>Filtros de recaudación:</strong>

        Año: {{ $anioSeleccionado ?? now()->year }} |
        Período: {{ $periodoLabel }} |
        Categoría: {{ $categoriaLabel }} |
        Concepto: {{ $conceptoLabel }}
    </div>

</div>

{{-- 1. ESTADÍSTICAS GENERALES --}}

<div class="section">

    <div class="section-title">
        1. Estadísticas generales
    </div>

    <table class="stats-table">

        @php
            $estadisticasItems = collect($estadisticas ?? [])->all();
            $estadisticasItems = array_chunk($estadisticasItems, 3, true);
        @endphp

        @forelse ($estadisticasItems as $fila)

            <tr>

                @foreach ($fila as $clave => $valor)

                    @php
                        $etiqueta = $etiquetasEstadisticas[$clave]
                            ?? ucfirst(str_replace('_', ' ', $clave));

                        $valorFormateado = $esImporte($clave)
                            ? $formatearMoneda($valor)
                            : $formatearNumero($valor);
                    @endphp

                    <td class="stat-card" width="33.33%">
                        <div class="stat-label">
                            {{ $etiqueta }}
                        </div>

                        <div class="stat-value">
                            {{ $valorFormateado }}
                        </div>
                    </td>

                @endforeach

                @for ($i = count($fila); $i < 3; $i++)
                    <td width="33.33%"></td>
                @endfor

            </tr>

        @empty

            <tr>
                <td class="empty">
                    No hay estadísticas disponibles.
                </td>
            </tr>

        @endforelse

    </table>

</div>

{{-- 2. RECAUDACIÓN MENSUAL --}}

<div class="section">

    <div class="section-title">
        2. Recaudación mensual
    </div>

    <p>
        Período analizado:
        <strong>{{ $periodoLabel }}</strong>
    </p>

    <table class="data-table">

        <thead>
            <tr>
                <th>Mes</th>
                <th class="text-right">Total recaudado</th>
            </tr>
        </thead>

        <tbody>

            @forelse (($recaudacionMensual ?? []) as $item)

                <tr>
                    <td>{{ $item['mes'] ?? '-' }}</td>

                    <td class="text-right amount">
                        {{ $formatearMoneda($item['total'] ?? 0) }}
                    </td>
                </tr>

            @empty

                <tr>
                    <td colspan="2" class="empty">
                        No hay información de recaudación para el período seleccionado.
                    </td>
                </tr>

            @endforelse

        </tbody>

    </table>

    <div class="total-box">
        <span>Total recaudado en el período</span>

        <strong>
            {{ $formatearMoneda($totalRecaudacionMensual ?? 0) }}
        </strong>
    </div>

</div>

{{-- 3. RESUMEN POR CATEGORÍA --}}

<div class="section">

    <div class="section-title">
        3. Resumen económico por categoría
    </div>

    <table class="data-table">

        <thead>
            <tr>
                <th>Categoría</th>
                <th class="text-center">Año</th>
                <th class="text-right">Jugadores activos</th>
                <th class="text-right">Total recaudado</th>
                <th class="text-right">Deuda pendiente</th>
            </tr>
        </thead>

        <tbody>

            @forelse (($reportesPorCategoria ?? []) as $item)

                <tr>
                    <td>{{ $item['categoria'] ?? '-' }}</td>

                    <td class="text-center">
                        {{ $item['anio'] ?? '-' }}
                    </td>

                    <td class="text-right">
                        {{ $formatearNumero($item['jugadoresActivos'] ?? 0) }}
                    </td>

                    <td class="text-right amount">
                        {{ $formatearMoneda($item['totalRecaudado'] ?? 0) }}
                    </td>

                    <td class="text-right amount">
                        {{ $formatearMoneda($item['deudaPendiente'] ?? 0) }}
                    </td>
                </tr>

            @empty

                <tr>
                    <td colspan="5" class="empty">
                        No hay información disponible por categoría.
                    </td>
                </tr>

            @endforelse

        </tbody>

    </table>

</div>

{{-- 4. DETALLE DE DEUDAS --}}

<div class="section page-break">

    <div class="section-title">
        4. Detalle de deudas pendientes
    </div>

    <table class="data-table">

        <thead>
            <tr>
                <th>ID jugador</th>
                <th>Jugador</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Concepto</th>
                <th>Cuota</th>
                <th class="text-right">Monto</th>
                <th class="text-right">Pagado</th>
                <th class="text-right">Saldo pendiente</th>
                <th>Vencimiento</th>
                <th>Estado vencimiento</th>
            </tr>
        </thead>

        <tbody>

            @forelse (($detalleDeudas ?? []) as $item)

                <tr>
                    <td>{{ $item['jugadorId'] ?? '-' }}</td>

                    <td>{{ $item['jugador'] ?? '-' }}</td>

                    <td>{{ $item['estadoJugador'] ?? '-' }}</td>

                    <td>{{ $item['categoria'] ?? '-' }}</td>

                    <td>{{ $item['concepto'] ?? '-' }}</td>

                    <td>{{ $item['cuota'] ?? '-' }}</td>

                    <td class="text-right amount">
                        {{ $formatearMoneda($item['montoCuota'] ?? 0) }}
                    </td>

                    <td class="text-right amount">
                        {{ $formatearMoneda($item['totalPagado'] ?? 0) }}
                    </td>

                    <td class="text-right amount negative">
                        {{ $formatearMoneda($item['saldoPendiente'] ?? 0) }}
                    </td>

                    <td>
                        @if (!empty($item['fechaVencimiento']))

                            {{ $item['fechaVencimiento'] instanceof \DateTimeInterface
                                ? $item['fechaVencimiento']->format('d/m/Y')
                                : \Carbon\Carbon::parse($item['fechaVencimiento'])->format('d/m/Y') }}

                        @else

                            Sin vencimiento

                        @endif
                    </td>

                    <td>
                        {{ $item['estadoVencimiento'] ?? '-' }}
                    </td>

                </tr>

            @empty

                <tr>
                    <td colspan="11" class="empty">
                        No hay deudas pendientes registradas.
                    </td>
                </tr>

            @endforelse

        </tbody>

    </table>

</div>

{{-- PIE DE PÁGINA --}}

<div class="footer">

    <table class="footer-table">

        <tr>
            <td>
                CHANGUITOS V.S.A. - FulbitoGest
                <br>
                Fomentando el deporte, construimos valores.
            </td>

            <td class="footer-right">
                Informe económico y administrativo
            </td>
        </tr>

    </table>

</div>

<script type="text/php">
    if (isset($pdf)) {
        $font = $fontMetrics->getFont("DejaVu Sans", "normal");

        $pdf->page_text(
            755,
            575,
            "Página {PAGE_NUM} de {PAGE_COUNT}",
            $font,
            7,
            [0.58, 0.64, 0.72]
        );
    }
</script>

</body>
</html>