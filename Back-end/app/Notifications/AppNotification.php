<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppNotification extends Notification
{
    use Queueable;

    protected $data;

    /**
     * Create a new notification instance.
     *
     * @param array $data ['titulo', 'mensagem', 'tipo', 'url_acao', 'id_objeto', 'tipo_objeto']
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'titulo' => $this->data['titulo'] ?? 'Notificação',
            'mensagem' => $this->data['mensagem'] ?? '',
            'tipo' => $this->data['tipo'] ?? 'info', // info, success, warning, error
            'url_acao' => $this->data['url_acao'] ?? null,
            'id_objeto' => $this->data['id_objeto'] ?? null,
            'tipo_objeto' => $this->data['tipo_objeto'] ?? null,
        ];
    }
}
