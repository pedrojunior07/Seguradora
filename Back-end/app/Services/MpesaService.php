<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    private $client;
    private $serviceProviderCode;
    private $publicKey;
    private $apiKey;
    private $endpoint;
    private $origin;

    public function __construct()
    {
        $this->client = new Client([
            'verify' => false, // No ambiente de desenvolvimento moçambicano, certificados SSL às vezes falham sem isso
            'timeout'  => 30.0,
        ]);

        $this->serviceProviderCode = config('services.mpesa.service_provider_code');
        $this->publicKey = config('services.mpesa.public_key');
        $this->apiKey = config('services.mpesa.api_key');
        $this->endpoint = config('services.mpesa.endpoint');
        $this->origin = config('services.mpesa.origin');
    }

    /**
     * Gera o Token de autorização em Base64 usando criptografia RSA.
     */
    private function generateBearerToken()
    {
        try {
            // Formata a chave pública para o padrão OpenSSL
            $publicKeyFormatted = "-----BEGIN PUBLIC KEY-----\n" . chunk_split($this->publicKey, 64, "\n") . "-----END PUBLIC KEY-----";
            
            $encrypted = "";
            if (openssl_public_encrypt($this->apiKey, $encrypted, $publicKeyFormatted, OPENSSL_PKCS1_PADDING)) {
                return base64_encode($encrypted);
            }
            throw new \Exception("Falha na criptografia OpenSSL.");
        } catch (\Exception $e) {
            Log::error("Erro ao gerar token M-Pesa: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Inicia um pagamento C2B Push (STK Push).
     * O celular do cliente receberá o prompt USSD na hora.
     */
    public function iniciarPagamentoC2B(string $numeroTelefone, float $valor, string $referencia)
    {
        // Garantir formato 258...
        if (!str_starts_with($numeroTelefone, '258')) {
            if (str_starts_with($numeroTelefone, '84') || str_starts_with($numeroTelefone, '85')) {
                $numeroTelefone = '258' . $numeroTelefone;
            }
        }

        $token = $this->generateBearerToken();
        if (!$token) {
            return ['success' => false, 'message' => 'Erro de configuração de segurança (RSA).'];
        }

        try {
            $payload = [
                'input_TransactionReference' => $referencia,
                'input_CustomerMSISDN' => $numeroTelefone,
                'input_Amount' => (string) round($valor, 2),
                'input_ThirdPartyReference' => $referencia,
                'input_ServiceProviderCode' => $this->serviceProviderCode
            ];

            $response = $this->client->post($this->endpoint . '/ipg/v1x/c2bPayment/', [
                'headers' => [
                    'Authorization' => "Bearer $token",
                    'Content-Type'  => 'application/json',
                    'Origin'        => $this->origin,
                ],
                'json' => $payload,
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            Log::info("M-Pesa API Response: " . json_encode($body));

            $code = $body['output_ResponseCode'] ?? 'FAILED';
            
            return [
                'success' => ($code === 'INS-0'), // INS-0 é sucesso na Vodacom
                'transaction_id' => $body['output_TransactionID'] ?? null,
                'conversation_id' => $body['output_ConversationID'] ?? null,
                'message' => $body['output_ResponseDesc'] ?? 'Pedido processado.',
                'status' => $code
            ];
        } catch (\Exception $e) {
            Log::error("Erro na API M-Pesa: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Ocorreu um erro ao enviar o Push USSD: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Opcional: Consultar status da transação.
     */
    public function consultarTransacao(string $transactionId) {
        // Implementar consulta Query via API se necessário
        return ['status' => 'COMPLETE']; // Mockado para testes
    }
}
