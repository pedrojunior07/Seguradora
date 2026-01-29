<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
        .header { background-color: #1e40af; color: #fff; padding: 10px 15px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #fff; border: 1px solid #eee; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        .label { font-weight: bold; color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">Nova Mensagem de Suporte</h2>
        </div>
        <div class="content">
            <p><span class="label">Remetente:</span> {{ $data['user_name'] }} ({{ $data['user_email'] }})</p>
            <p><span class="label">Data:</span> {{ $data['data_envio'] }}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
            <p><span class="label">Assunto:</span> {{ $data['assunto'] }}</p>
            <p><span class="label">Mensagem:</span></p>
            <div style="background: #f0f7ff; padding: 15px; border-radius: 5px; border-left: 4px solid #1e40af;">
                {!! nl2br(e($data['mensagem'])) !!}
            </div>
        </div>
        <div class="footer">
            <p>Este email foi enviado automaticamente pelo sistema SegurosTM.</p>
        </div>
    </div>
</body>
</html>
