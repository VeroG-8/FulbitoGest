<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RecordatorioVencimientoCuota extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $nombreTutor,
        public string $nombreJugador,
        public string $nombreCuota,
        public string $fechaVencimiento,
        public float $saldoPendiente
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recordatorio de vencimiento de cuota - FulbitoGest',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.cuotas.recordatorio-vencimiento',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}