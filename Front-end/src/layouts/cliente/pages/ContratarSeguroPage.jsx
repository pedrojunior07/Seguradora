import React, { useState, useEffect } from 'react';
import {
  Steps,
  Button,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Alert,
  Result,
  Avatar
} from 'antd';
import {
  CarOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';

const { Step } = Steps;
const { Title, Text } = Typography;

const ContratarSeguroPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seguradora: preSelectedSeguradora, seguro: preSelectedSeguro } = location.state || {};

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Dados
  const [veiculos, setVeiculos] = useState([]);
  const [seguros, setSeguros] = useState([]);

  // Seleções
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [selectedSeguro, setSelectedSeguro] = useState(null);
  const [selectedPreco, setSelectedPreco] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [veiculosRes, segurosRes] = await Promise.all([
          clienteService.getMeusVeiculos(),
          clienteService.getSegurosDisponiveis()
        ]);
        setVeiculos(veiculosRes.data || []);

        const todosSeguros = segurosRes.data || [];
        setSeguros(todosSeguros);

        // Lógica de Pré-seleção
        if (preSelectedSeguro) {
          const match = todosSeguros.find(s => s.id_seguro === preSelectedSeguro.id_seguro);
          if (match) {
            setSelectedSeguro(match);
          } else {
            // Adiciona manualmente se não estiver na lista geral
            setSeguros(prev => [...prev, preSelectedSeguro]);
            setSelectedSeguro(preSelectedSeguro);
          }
          // Se houver pre-seleção, pode-se avançar o step, mas step 0 é veiculo.
        }
      } catch (error) {
        console.error(error);
        message.error('Erro ao carregar dados iniciais');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [preSelectedSeguro]);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleContratar = async () => {
    setLoading(true);
    try {
      const payload = {
        veiculo_id: selectedVeiculo.id_veiculo,
        seguro_id: selectedSeguro.id_seguro,
        seguradora_id: selectedSeguro.id_seguradora || preSelectedSeguradora?.id_seguradora || 1,
        preco_id: selectedPreco.id_preco
      };
      await clienteService.contratarSeguro(payload);
      message.success('Seguro contratado com sucesso!');
      navigate('/cliente/dashboard');
    } catch (error) {
      console.error(error);
      message.error('Erro ao realizar contratação: ' + (error.response?.data?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Veículo',
      icon: <CarOutlined />,
      content: (
        <Row gutter={[16, 16]}>
          {veiculos.length > 0 ? veiculos.map(v => (
            <Col span={8} key={v.id_veiculo}>
              <Card
                hoverable
                onClick={() => setSelectedVeiculo(v)}
                className={selectedVeiculo?.id_veiculo === v.id_veiculo ? 'border-primary' : ''}
                style={{ border: selectedVeiculo?.id_veiculo === v.id_veiculo ? '2px solid #1890ff' : '' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<CarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title={`${v.marca} ${v.modelo}`}
                  description={v.matricula}
                />
              </Card>
            </Col>
          )) : <Col span={24}><Alert message="Nenhum veículo encontrado." type="warning" /></Col>}
        </Row>
      ),
    },
    {
      title: 'Seguro',
      icon: <SafetyCertificateOutlined />,
      content: (
        <Row gutter={[16, 16]}>
          {seguros.length > 0 ? seguros.map(s => (
            <Col span={8} key={s.id_seguro}>
              <Card
                hoverable
                onClick={() => { setSelectedSeguro(s); setSelectedPreco(null); }}
                style={{ border: selectedSeguro?.id_seguro === s.id_seguro ? '2px solid #1890ff' : '' }}
              >
                <Title level={4}>{s.nome}</Title>
                <Text type="secondary">{s.descricao}</Text>
              </Card>
            </Col>
          )) : <Col span={24}><Alert message="Nenhum seguro disponível no momento." type="info" /></Col>}
        </Row>
      ),
    },
    {
      title: 'Plano',
      icon: <DollarOutlined />,
      content: (
        <Row gutter={[16, 16]}>
          {selectedSeguro?.precos?.length > 0 ? selectedSeguro.precos.map(p => (
            <Col span={8} key={p.id_preco}>
              <Card
                hoverable
                onClick={() => setSelectedPreco(p)}
                style={{ border: selectedPreco?.id_preco === p.id_preco ? '2px solid #52c41a' : '' }}
              >
                <Statistic
                  title={p.descricao || p.periodicidade}
                  value={p.valor_base}
                  suffix="MZN"
                  valueStyle={{ color: '#3f8600' }}
                />
                <Text type="secondary">/{p.periodicidade}</Text>
              </Card>
            </Col>
          )) : (
            <Col span={24}>
              {selectedSeguro ?
                <Alert message="Este seguro não possui planos de preços configurados." type="warning" /> :
                <Alert message="Selecione um seguro primeiro." type="info" />
              }
            </Col>
          )}
        </Row>
      ),
    },
    {
      title: 'Confirmar',
      icon: <CheckCircleOutlined />,
      content: (
        <Card>
          <Result
            status="info"
            title="Confirme a Contratação"
            subTitle="Verifique os dados abaixo antes de confirmar."
          >
            <div className="desc">
              <Text strong>Veículo: </Text> <Text>{selectedVeiculo?.marca} {selectedVeiculo?.modelo} ({selectedVeiculo?.matricula})</Text><br />
              <Text strong>Seguro: </Text> <Text>{selectedSeguro?.nome}</Text><br />
              <Text strong>Plano: </Text> <Text>{selectedPreco?.periodicidade} - {selectedPreco?.valor_base} MZN</Text>
            </div>
          </Result>
        </Card>
      ),
    },
  ];

  return (
    <ClienteLayout>
      <Card title="Nova Contratação">
        {initialLoading ? <Spin size="large" /> : (
          <>
            <Steps current={current}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} icon={item.icon} />
              ))}
            </Steps>
            <div className="steps-content" style={{ marginTop: 24, minHeight: 200 }}>
              {steps[current].content}
            </div>
            <div className="steps-action" style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              {current > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                  Anterior
                </Button>
              )}
              {current < steps.length - 1 && (
                <Button type="primary" onClick={() => next()} disabled={
                  (current === 0 && !selectedVeiculo) ||
                  (current === 1 && !selectedSeguro) ||
                  (current === 2 && !selectedPreco)
                }>
                  Próximo
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" onClick={handleContratar} loading={loading}>
                  Finalizar Contratação
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
    </ClienteLayout>
  );
};

export default ContratarSeguroPage;
