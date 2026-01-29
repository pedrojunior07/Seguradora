import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, Divider, Typography, message, List, Skeleton } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import AdminService from '../../../services/admin.service';

const { Title, Text } = Typography;

const SystemSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getSettings();
            setSettings(data);
        } catch (error) {
            message.error('Erro ao carregar configurações.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (key, value) => {
        try {
            await AdminService.updateSetting(key, value);
            message.success('Configuração salva com sucesso.');
            fetchSettings();
        } catch (error) {
            message.error('Erro ao salvar configuração.');
        }
    };

    // Placeholder settings if DB is empty, for UI demonstration
    const demoSettings = [
        { key: 'site_name', label: 'Nome do Sistema', value: 'Seguros TM', type: 'string' },
        { key: 'maintenance_mode', label: 'Modo Manutenção', value: false, type: 'boolean' },
        { key: 'security_2fa', label: 'Exigir 2FA para Admins', value: true, type: 'boolean' },
    ];

    const displaySettings = settings.length > 0 ? settings : demoSettings; // Use demo if empty for now

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={2}>Configurações do Sistema</Title>

            <Card title="Geral" style={{ marginBottom: 24 }}>
                <List
                    itemLayout="horizontal"
                    loading={loading}
                    dataSource={displaySettings}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                item.type === 'boolean' ? (
                                    <Switch
                                        checked={item.value == '1' || item.value === true}
                                        onChange={(checked) => handleSave(item.key, checked)}
                                    />
                                ) : (
                                    <Button type="primary" size="small" icon={<SaveOutlined />}
                                        onClick={() => {
                                            const input = document.getElementById(`input-${item.key}`);
                                            if (input) handleSave(item.key, input.value);
                                        }}>
                                        Salvar
                                    </Button>
                                )
                            ]}
                        >
                            <List.Item.Meta
                                title={item.label || item.key}
                                description={item.description || "Configuração do sistema"}
                            />
                            {item.type !== 'boolean' && (
                                <Input
                                    id={`input-${item.key}`}
                                    defaultValue={item.value}
                                    style={{ width: 300 }}
                                />
                            )}
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default SystemSettings;
