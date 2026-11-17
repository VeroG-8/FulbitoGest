<x-mail::message>
# Recordatorio de vencimiento

Hola {{ $nombreTutor }},

Te recordamos que mañana vence una cuota correspondiente al jugador **{{ $nombreJugador }}**.

<x-mail::panel>
**Concepto:** {{ $nombreCuota }}

**Fecha de vencimiento:** {{ $fechaVencimiento }}

**Saldo pendiente:** ${{ number_format($saldoPendiente, 2, ',', '.') }}
</x-mail::panel>

Te recomendamos realizar el pago antes de la fecha de vencimiento para mantener las cuotas al día.

Si ya realizaste el pago, podés desestimar este recordatorio.

Saludos,

**Equipo de FulbitoGest**
</x-mail::message>