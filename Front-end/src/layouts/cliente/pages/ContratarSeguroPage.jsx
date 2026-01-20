import React, { useState, useEffect } from 'react';
import {
  Steps,
  Button,
  message,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Input,
  Form,
  InputNumber,
  Select,
  Badge,
  Avatar,
  Rate,
  Tooltip,
  Empty,
  Result,
  Progress,
  Tag,
  Divider,
  Modal
} from 'antd';
import {
  CarOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  ContainerOutlined,
  BankOutlined,
  CheckCircleFilled,
  SafetyCertificateFilled,
  EyeOutlined,
  HeartOutlined,
  FileTextOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  CreditCardOutlined,
  LockOutlined,
  DeleteOutlined,
  EditOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

const ContratarSeguroPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seguradora: preSelectedSeguradora, seguro: preSelectedSeguro } = location.state || {};

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);



  // Dados do Cliente
  const [veiculos, setVeiculos] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  const [segurosDisponiveis, setSegurosDisponiveis] = useState([]);

  // Seleções e Estado do Fluxo
  const [assetType, setAssetType] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedSeguro, setSelectedSeguro] = useState(null);
  const [valorBem, setValorBem] = useState(0);
  const [cotacao, setCotacao] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [finished, setFinished] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const [comparedSeguros, setComparedSeguros] = useState([]);
  const [favoriteSeguros, setFavoriteSeguros] = useState(new Set());

  // Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('premium');

  // Estado da Avaliação


  // Buscar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        const [veiculosRes, propriedadesRes, segurosRes] = await Promise.all([
          clienteService.getMeusVeiculos(),
          clienteService.getMinhasPropriedades(),
          clienteService.getSegurosDisponiveis()
        ]);

        setVeiculos(veiculosRes.data || []);
        setPropriedades(propriedadesRes.data || []);
        setSegurosDisponiveis(segurosRes.data || []);

        if (preSelectedSeguro) {
          setSelectedSeguro(preSelectedSeguro);
        }
      } catch (error) {
        console.error(error);
        message.error('Erro ao carregar dados. Tente novamente.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [preSelectedSeguro]);

  // Simular cotação
  useEffect(() => {
    if (current === 3 && selectedSeguro && valorBem > 0) {
      handleSimular();
    }
  }, [current, valorBem, selectedSeguro]);

  const handleSimular = async () => {
    setSimulating(true);
    try {
      const id_ss = selectedSeguro.id_seguradora_seguro || selectedSeguro.id;
      const res = await clienteService.simularCotacao({
        id_seguradora_seguro: id_ss,
        valor_bem: valorBem
      });
      setCotacao(res);
    } catch (error) {
      console.error(error);
    } finally {
      setSimulating(false);
    }
  };



  const handleContratar = async () => {
    setLoading(true);
    try {
      const idSeguradoraSeguro = selectedSeguro.id_seguradora_seguro || selectedSeguro.id;

      const payload = {
        id_seguradora_seguro: idSeguradoraSeguro,
        valor_bem: valorBem,
        id_bem: assetType === 'veiculo' ? selectedAsset.id_veiculo : selectedAsset.id_propriedade,
        tipo_bem: assetType
      };

      const res = await clienteService.enviarProposta(payload);
      setSuccessInfo(res);
      setFinished(true);
    } catch (error) {
      console.error(error);
      message.error('Erro ao enviar proposta.');
    } finally {
      setLoading(false);
    }
  };

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);



  const toggleCompare = (seguro) => {
    if (comparedSeguros.find(s => s.id === seguro.id)) {
      setComparedSeguros(comparedSeguros.filter(s => s.id !== seguro.id));
    } else if (comparedSeguros.length < 3) {
      setComparedSeguros([...comparedSeguros, seguro]);
    } else {
      message.warning('Você pode comparar no máximo 3 seguros.');
    }
  };

  const toggleFavorite = (seguroId) => {
    const newFavorites = new Set(favoriteSeguros);
    if (newFavorites.has(seguroId)) {
      newFavorites.delete(seguroId);
    } else {
      newFavorites.add(seguroId);
    }
    setFavoriteSeguros(newFavorites);
  };

  // Filtros e ordenação
  const filteredSeguros = segurosDisponiveis
    .filter(s => {
      const termo = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        s.seguro?.nome?.toLowerCase().includes(termo) ||
        s.seguradora?.nome?.toLowerCase().includes(termo) ||
        s.seguro?.descricao?.toLowerCase().includes(termo);

      const matchesAssetType = assetType === 'veiculo'
        ? s.seguro?.categoria?.descricao?.toLowerCase().includes('veiculo') ||
        s.seguro?.categoria?.descricao?.toLowerCase().includes('auto')
        : s.seguro?.categoria?.descricao?.toLowerCase().includes('propriedade') ||
        s.seguro?.categoria?.descricao?.toLowerCase().includes('imovel');

      return matchesSearch && matchesAssetType;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'premium': return (a.premio_minimo || 0) - (b.premio_minimo || 0);
        case 'rating': return (b.seguradora?.rating || 0) - (a.seguradora?.rating || 0);
        case 'name': return a.seguro?.nome?.localeCompare(b.seguro?.nome);
        default: return 0;
      }
    });

  // Componente de sucesso
  if (finished) {
    return (
      <ClienteLayout>
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <Result
            status="info"
            title={
              <span style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#262626'
              }}>
                Proposta Enviada com Sucesso!
              </span>
            }
            subTitle="Sua proposta foi enviada para análise da seguradora. Você será notificado assim que houver uma atualização."
            extra={[
              <Button
                type="primary"
                key="dashboard"
                size="large"
                onClick={() => navigate('/cliente/dashboard')}
                style={{
                  height: '48px',
                  padding: '0 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 500
                }}
                icon={<HomeOutlined />}
              >
                Ir para Dashboard
              </Button>,
              <Button
                key="proposals"
                size="large"
                onClick={() => navigate('/cliente/minhas-propostas')}
                style={{
                  height: '48px',
                  padding: '0 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  borderColor: '#1890ff',
                  color: '#1890ff'
                }}
                icon={<FileTextOutlined />}
              >
                Minhas Propostas
              </Button>
            ]}
          >
            <Card
              style={{
                borderRadius: '12px',
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                marginTop: '32px'
              }}
            >
              <Title level={4} style={{ color: '#262626', marginBottom: '24px' }}>
                <FileTextOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                Resumo da Proposta
              </Title>

              <Row gutter={[32, 24]}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: '#595959' }}>
                      Número da Proposta:
                    </Text>
                    <div style={{
                      background: '#fff',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9'
                    }}>
                      <Text strong style={{ color: '#262626', fontSize: '16px' }}>
                        #{successInfo?.data?.numero_proposta || 'AGUARDANDO'}
                      </Text>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: '#595959' }}>
                      Seguro:
                    </Text>
                    <div style={{
                      background: '#fff',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9'
                    }}>
                      <Text strong style={{ color: '#262626' }}>{selectedSeguro?.seguro?.nome}</Text>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: '#595959' }}>
                      Prêmio Calculado:
                    </Text>
                    <div style={{
                      background: '#1890ff',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <Text strong style={{ color: 'white', fontSize: '20px' }}>
                        {parseFloat(successInfo?.data?.premio_calculado || 0).toLocaleString('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN'
                        })}
                      </Text>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: '#595959' }}>
                      Status Atual:
                    </Text>
                    <div style={{
                      background: '#faad14',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      <Text strong style={{ color: 'white' }}>
                        <SyncOutlined spin /> EM ANÁLISE
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Result>
        </div>
      </ClienteLayout>
    );
  }

  // Steps
  const steps = [
    {
      title: 'Tipo de Bem',
      icon: <CheckCircleOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Title level={2} style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>
            O que você deseja segurar?
          </Title>
          <Paragraph style={{ fontSize: '16px', color: '#595959', maxWidth: '500px', margin: '0 auto 40px' }}>
            Selecione a categoria do bem para iniciar a cotação
          </Paragraph>

          <Row gutter={[32, 32]} justify="center" style={{ marginTop: '40px' }}>
            <Col xs={24} sm={12} lg={10}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  border: assetType === 'veiculo' ? '2px solid #1890ff' : '1px solid #f0f0f0',
                  background: assetType === 'veiculo' ? '#fafafa' : 'white',
                  height: '100%',
                  transition: 'all 0.3s'
                }}
                onClick={() => { setAssetType('veiculo'); setSelectedAsset(null); }}
              >
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 24px',
                    background: '#f0f5ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: '#1890ff'
                  }}>
                    <CarOutlined />
                  </div>

                  <Title level={3} style={{ marginBottom: '12px', fontSize: '20px', color: '#262626' }}>
                    Veículo
                  </Title>
                  <Paragraph style={{ color: '#595959', marginBottom: '24px' }}>
                    Automóveis, Motos, Camiões
                  </Paragraph>

                  <div style={{
                    background: '#f0f5ff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    <Text style={{ color: '#1890ff', fontSize: '14px' }}>
                      {veiculos.length} veículo(s) cadastrado(s)
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={10}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  border: assetType === 'propriedade' ? '2px solid #722ed1' : '1px solid #f0f0f0',
                  background: assetType === 'propriedade' ? '#fafafa' : 'white',
                  height: '100%',
                  transition: 'all 0.3s'
                }}
                onClick={() => { setAssetType('propriedade'); setSelectedAsset(null); }}
              >
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 24px',
                    background: '#f9f0ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: '#722ed1'
                  }}>
                    <HomeOutlined />
                  </div>

                  <Title level={3} style={{ marginBottom: '12px', fontSize: '20px', color: '#262626' }}>
                    Propriedade
                  </Title>
                  <Paragraph style={{ color: '#595959', marginBottom: '24px' }}>
                    Casas, Apartamentos, Terrenos
                  </Paragraph>

                  <div style={{
                    background: '#f9f0ff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    <Text style={{ color: '#722ed1', fontSize: '14px' }}>
                      {propriedades.length} propriedade(s) cadastrada(s)
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      title: 'Selecionar Bem',
      icon: <CarOutlined />,
      content: (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>
              Selecione seu {assetType === 'veiculo' ? 'veículo' : 'imóvel'}
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
              Escolha o item da sua lista ou cadastre um novo
            </Paragraph>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '16px',
            background: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #f0f0f0'
          }}>
            <div>
              <Text strong style={{ fontSize: '16px', color: '#262626' }}>Total disponível: </Text>
              <Badge
                count={assetType === 'veiculo' ? veiculos.length : propriedades.length}
                style={{ backgroundColor: '#1890ff', fontSize: '14px' }}
              />
            </div>

            {assetType === 'veiculo' && (
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate('/cliente/veiculos')}
                style={{
                  height: '40px',
                  padding: '0 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Gerir Veículos
              </Button>
            )}
          </div>

          {assetType === 'veiculo' ? (
            veiculos.length > 0 ? (
              <Row gutter={[24, 24]}>
                {veiculos.map(v => (
                  <Col xs={24} md={12} lg={8} key={v.id_veiculo}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: '8px',
                        border: selectedAsset?.id_veiculo === v.id_veiculo ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        background: selectedAsset?.id_veiculo === v.id_veiculo ? '#fafafa' : 'white',
                        height: '100%'
                      }}
                      onClick={() => {
                        setSelectedAsset(v);
                        setValorBem(v.valor_estimado);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#f0f5ff',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              color: '#1890ff'
                            }}>
                              <CarOutlined />
                            </div>
                            <div>
                              <Title level={4} style={{ margin: 0, fontSize: '16px' }}>{v.marca}</Title>
                              <Text type="secondary" style={{ fontSize: '14px' }}>{v.modelo}</Text>
                            </div>
                          </div>

                          <Tag color="blue" style={{ margin: 0, fontSize: '12px' }}>
                            {v.matricula}
                          </Tag>
                        </div>

                        {selectedAsset?.id_veiculo === v.id_veiculo && (
                          <CheckCircleFilled style={{ color: '#52c41a', fontSize: '20px' }} />
                        )}
                      </div>

                      <Divider style={{ margin: '16px 0' }} />

                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Ano</Text>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{v.ano_fabrico}</div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Cor</Text>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{v.cor}</div>
                        </Col>
                        <Col span={24}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Valor Estimado</Text>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1890ff',
                            marginTop: '4px'
                          }}>
                            {parseFloat(v.valor_estimado).toLocaleString('pt-MZ', {
                              style: 'currency',
                              currency: 'MZN'
                            })}
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description={
                  <div>
                    <Title level={4} style={{ color: '#262626' }}>Nenhum veículo cadastrado</Title>
                    <Paragraph type="secondary" style={{ color: '#595959' }}>
                      Cadastre seu primeiro veículo para começar
                    </Paragraph>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '80px 0' }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/cliente/veiculos')}
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Cadastrar Veículo
                </Button>
              </Empty>
            )
          ) : (
            propriedades.length > 0 ? (
              <Row gutter={[24, 24]}>
                {propriedades.map(p => (
                  <Col xs={24} md={12} lg={8} key={p.id_propriedade}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: '8px',
                        border: selectedAsset?.id_propriedade === p.id_propriedade ? '2px solid #722ed1' : '1px solid #f0f0f0',
                        background: selectedAsset?.id_propriedade === p.id_propriedade ? '#fafafa' : 'white',
                        height: '100%'
                      }}
                      onClick={() => { setSelectedAsset(p); setValorBem(p.valor_estimado); }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#f9f0ff',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              color: '#722ed1'
                            }}>
                              <HomeOutlined />
                            </div>
                            <div>
                              <Title level={4} style={{ margin: 0, fontSize: '16px' }}>
                                {p.descricao}
                              </Title>
                              <Text type="secondary" style={{ fontSize: '14px' }}>{p.tipo_propriedade}</Text>
                            </div>
                          </div>
                        </div>

                        {selectedAsset?.id_propriedade === p.id_propriedade && (
                          <CheckCircleFilled style={{ color: '#722ed1', fontSize: '20px' }} />
                        )}
                      </div>

                      <Divider style={{ margin: '16px 0' }} />

                      <div style={{ marginBottom: '12px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Endereço</Text>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>
                          {p.endereco || 'Não informado'}
                        </div>
                      </div>

                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Valor Estimado</Text>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#722ed1',
                          marginTop: '4px'
                        }}>
                          {parseFloat(p.valor_estimado).toLocaleString('pt-MZ', {
                            style: 'currency',
                            currency: 'MZN'
                          })}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                description="Nenhuma propriedade cadastrada"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '80px 0' }}
              />
            )
          )}
        </div>
      )
    },
    // Passo Avaliação Removido
    {
      title: 'Planos',
      icon: <DollarOutlined />,
      content: (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>
              Escolha seu Plano
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
              Compare e selecione a melhor opção para suas necessidades
            </Paragraph>
          </div>

          <div style={{
            padding: '24px',
            background: '#fafafa',
            borderRadius: '8px',
            marginBottom: '32px',
            border: '1px solid #f0f0f0'
          }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Input.Search
                  placeholder="Buscar planos, seguradoras..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>

              <Col xs={24} md={12}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Select
                      value={sortOrder}
                      onChange={setSortOrder}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <Select.Option value="premium">Menor Prêmio</Select.Option>
                      <Select.Option value="rating">Melhor Avaliação</Select.Option>
                      <Select.Option value="name">Nome A-Z</Select.Option>
                    </Select>
                  </Col>

                  <Col span={12}>
                    <Button
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={() => setShowCompare(!showCompare)}
                      style={{ width: '100%', height: '40px' }}
                    >
                      Comparar ({comparedSeguros.length})
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          {showCompare && comparedSeguros.length > 0 && (
            <div style={{
              padding: '24px',
              background: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              marginBottom: '32px'
            }}>
              <Title level={4} style={{ marginBottom: '16px', color: '#262626' }}>
                <EyeOutlined style={{ marginRight: '8px' }} /> Comparação de Planos
              </Title>
              <Row gutter={[24, 24]}>
                {comparedSeguros.map(seguro => (
                  <Col xs={24} md={8} key={seguro.id}>
                    <Card style={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong style={{ fontSize: '14px' }}>{seguro.seguro?.nome}</Text>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => toggleCompare(seguro)}
                          style={{ padding: '0', minWidth: 'auto' }}
                        >
                          ×
                        </Button>
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#1890ff' }}>
                        {parseFloat(seguro.premio_minimo || 0).toLocaleString('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN'
                        })}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {filteredSeguros.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredSeguros.map((s, index) => (
                <Col xs={24} md={12} lg={8} key={s.id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: '8px',
                      border: selectedSeguro?.id === s.id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                      background: selectedSeguro?.id === s.id ? '#fafafa' : 'white',
                      height: '100%',
                      position: 'relative'
                    }}
                  >
                    {index === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#1890ff',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 500
                      }}>
                        RECOMENDADO
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar
                          size={40}
                          src={s.seguradora?.logotipo}
                          icon={!s.seguradora?.logotipo && <BankOutlined />}
                          style={{
                            background: '#f0f0f0',
                            color: '#595959',
                            fontSize: '16px'
                          }}
                        />
                        <div>
                          <Text strong style={{ fontSize: '14px', color: '#262626' }}>{s.seguradora?.nome}</Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Rate
                              disabled
                              defaultValue={s.seguradora?.rating || 4.5}
                              style={{ fontSize: '12px' }}
                            />
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              ({s.seguradora?.reviews || 150})
                            </Text>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Tooltip title={favoriteSeguros.has(s.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                          <Button
                            type="text"
                            size="small"
                            icon={<HeartOutlined style={{
                              color: favoriteSeguros.has(s.id) ? '#f5222d' : '#d9d9d9',
                              fontSize: '16px'
                            }} />}
                            onClick={() => toggleFavorite(s.id)}
                            style={{ padding: '0', minWidth: 'auto' }}
                          />
                        </Tooltip>
                        <Tooltip title="Comparar plano">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined style={{
                              color: comparedSeguros.find(cs => cs.id === s.id) ? '#1890ff' : '#d9d9d9',
                              fontSize: '16px'
                            }} />}
                            onClick={() => toggleCompare(s)}
                            style={{ padding: '0', minWidth: 'auto' }}
                          />
                        </Tooltip>
                      </div>
                    </div>

                    <Title level={4} style={{ marginBottom: '8px', fontSize: '18px', color: '#262626' }}>
                      {s.seguro?.nome}
                    </Title>
                    <Paragraph type="secondary" style={{
                      marginBottom: '16px',
                      fontSize: '13px',
                      minHeight: '60px'
                    }}>
                      {s.seguro?.descricao}
                    </Paragraph>

                    <div style={{ marginBottom: '16px' }}>
                      <Tag color="default" style={{ marginBottom: '4px', fontSize: '11px' }}>
                        {s.seguro?.categoria?.descricao}
                      </Tag>
                      <Tag color="default" style={{ fontSize: '11px' }}>
                        Segurança
                      </Tag>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        PRÊMIO ANUAL A PARTIR DE
                      </Text>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#1890ff',
                        margin: '8px 0'
                      }}>
                        {parseFloat(s.premio_minimo || 0).toLocaleString('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN'
                        })}
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>/ano</Text>
                    </div>

                    <Button
                      type={selectedSeguro?.id === s.id ? "primary" : "default"}
                      block
                      size="middle"
                      onClick={() => setSelectedSeguro(s)}
                      style={{
                        borderRadius: '8px',
                        height: '36px',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      {selectedSeguro?.id === s.id ? 'Selecionado' : 'Selecionar Plano'}
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ color: '#262626' }}>Nenhum plano encontrado</Title>
                  <Paragraph type="secondary" style={{ color: '#595959' }}>
                    Tente ajustar os filtros de busca
                  </Paragraph>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '80px 0' }}
            />
          )}
        </div>
      )
    },
    {
      title: 'Confirmar',
      icon: <ContainerOutlined />,
      content: (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>
              Confirmação Final
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
              Revise todos os detalhes antes de confirmar a contratação
            </Paragraph>
          </div>

          <Card
            style={{
              borderRadius: '8px',
              background: 'white',
              border: '1px solid #f0f0f0'
            }}
          >
            <div style={{
              background: '#fafafa',
              padding: '32px',
              textAlign: 'center',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <SafetyCertificateFilled style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={2} style={{ color: '#262626', margin: 0, fontSize: '24px' }}>
                Resumo da Contratação
              </Title>
              <Paragraph style={{ color: '#595959', fontSize: '14px' }}>
                Confirme os detalhes abaixo para finalizar
              </Paragraph>
            </div>

            {!cotacao ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Spin size="large" tip="Calculando cotação..." />
              </div>
            ) : (
              <div style={{ padding: '32px' }}>
                <Row gutter={[32, 32]}>
                  <Col xs={24} lg={16}>
                    <Card
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                        background: '#fafafa'
                      }}
                    >
                      <Title level={4} style={{ marginBottom: '24px', color: '#262626' }}>
                        <CarOutlined style={{ marginRight: '8px' }} /> Informações do Bem
                      </Title>

                      <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: '20px' }}>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                              Tipo de Bem
                            </Text>
                            <div style={{
                              padding: '12px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #d9d9d9'
                            }}>
                              <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                                {assetType === 'veiculo' ? 'Veículo' : 'Propriedade'}
                              </Text>
                            </div>
                          </div>

                          <div style={{ marginBottom: '20px' }}>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                              Identificação
                            </Text>
                            <div style={{
                              padding: '12px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #d9d9d9'
                            }}>
                              <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                                {assetType === 'veiculo'
                                  ? `${selectedAsset?.marca} ${selectedAsset?.modelo}`
                                  : selectedAsset?.descricao}
                              </Text>
                            </div>
                          </div>
                        </Col>

                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: '20px' }}>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                              Valor Segurado
                            </Text>
                            <div style={{
                              padding: '12px',
                              background: '#1890ff',
                              borderRadius: '8px',
                              textAlign: 'center'
                            }}>
                              <Text strong style={{ fontSize: '16px', color: 'white' }}>
                                {parseFloat(valorBem).toLocaleString('pt-MZ', {
                                  style: 'currency',
                                  currency: 'MZN'
                                })}
                              </Text>
                            </div>
                          </div>

                          <div style={{ marginBottom: '20px' }}>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                              Identificador
                            </Text>
                            <div style={{
                              padding: '12px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #d9d9d9'
                            }}>
                              <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                                {assetType === 'veiculo'
                                  ? selectedAsset?.matricula
                                  : selectedAsset?.tipo_propriedade}
                              </Text>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Divider style={{ margin: '24px 0' }} />

                      <Title level={4} style={{ marginBottom: '24px', color: '#262626' }}>
                        <BankOutlined style={{ marginRight: '8px' }} /> Plano Selecionado
                      </Title>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <Avatar
                          size={48}
                          src={selectedSeguro?.seguradora?.logotipo}
                          style={{
                            background: '#f0f0f0',
                            color: '#595959',
                            fontSize: '18px'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                            {selectedSeguro?.seguro?.nome}
                          </Title>
                          <Text type="secondary" style={{ fontSize: '13px' }}>{selectedSeguro?.seguradora?.nome}</Text>
                          <div style={{ marginTop: '8px' }}>
                            <Tag color="default" style={{ fontSize: '11px' }}>
                              {selectedSeguro?.seguro?.categoria?.descricao}
                            </Tag>
                          </div>
                        </div>
                      </div>

                      <Divider style={{ margin: '24px 0' }} />

                      <Title level={4} style={{ marginBottom: '24px', color: '#262626' }}>
                        <FileTextOutlined style={{ marginRight: '8px' }} /> Coberturas Incluídas
                      </Title>

                      <Row gutter={[16, 16]}>
                        {cotacao.detalhes_cobertura?.map((c, index) => (
                          <Col xs={24} md={12} key={index}>
                            <div style={{
                              padding: '12px',
                              border: '1px solid #f0f0f0',
                              borderRadius: '8px',
                              background: 'white'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
                                <div>
                                  <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                                    {c.descricao}
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: '11px' }}>
                                    Franquia: {c.franquia}%
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Card
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #1890ff',
                        background: '#fafafa'
                      }}
                    >
                      <Title level={4} style={{ marginBottom: '24px', color: '#262626' }}>
                        <DollarOutlined style={{ marginRight: '8px' }} /> Resumo Financeiro
                      </Title>

                      <div style={{ marginBottom: '32px' }}>
                        {[
                          { label: 'Prêmio Base', value: cotacao.premio_base },
                          { label: 'Taxas Administrativas', value: cotacao.taxas || 0 },
                          { label: 'Desconto', value: cotacao.desconto, type: 'discount' }
                        ].map((item, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            paddingBottom: '16px',
                            borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                          }}>
                            <Text style={{ fontSize: '13px' }}>{item.label}</Text>
                            {item.type === 'discount' && item.value ? (
                              <Text type="success" strong style={{ fontSize: '13px' }}>
                                -{item.value}%
                              </Text>
                            ) : (
                              <Text strong style={{ fontSize: '13px' }}>
                                {parseFloat(item.value || 0).toLocaleString('pt-MZ', {
                                  style: 'currency',
                                  currency: 'MZN'
                                })}
                              </Text>
                            )}
                          </div>
                        ))}
                      </div>

                      <Divider style={{ margin: '24px 0' }} />

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        padding: '16px',
                        background: '#1890ff',
                        borderRadius: '8px'
                      }}>
                        <Text strong style={{ color: 'white', fontSize: '14px' }}>
                          Total Anual
                        </Text>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
                            {parseFloat(cotacao.premio_final).toLocaleString('pt-MZ', {
                              style: 'currency',
                              currency: 'MZN'
                            })}
                          </div>
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                            /ano
                          </Text>
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>
                          <CreditCardOutlined style={{ marginRight: '8px' }} /> Formas de Pagamento
                        </Title>
                        <Row gutter={[8, 8]}>
                          {['Cartão', 'Transferência', 'MPesa', 'Parcelado'].map((method, index) => (
                            <Col span={12} key={index}>
                              <div style={{
                                padding: '8px',
                                border: '1px solid #f0f0f0',
                                borderRadius: '6px',
                                textAlign: 'center',
                                background: 'white'
                              }}>
                                <Text style={{ fontSize: '11px' }}>{method}</Text>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<SafetyCertificateFilled />}
                        loading={loading}
                        onClick={handleContratar}
                        style={{
                          height: '48px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: 500
                        }}
                      >
                        Confirmar e Contratar
                      </Button>

                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                        textAlign: 'center'
                      }}>
                        <LockOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Suas informações estão seguras e protegidas
                        </Text>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </div>
      )
    }
  ];

  return (
    <ClienteLayout>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <Title level={1} style={{ fontSize: '32px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>
            Contratar Novo Seguro
          </Title>
          <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
            Siga os passos abaixo para garantir a melhor proteção para seus bens
          </Paragraph>

          <Progress
            percent={Math.round(((current + 1) / steps.length) * 100)}
            strokeColor="#1890ff"
            showInfo={false}
            style={{ maxWidth: '600px', marginTop: '16px' }}
          />
          <Text type="secondary" style={{ marginTop: '8px', display: 'block', fontSize: '13px' }}>
            Passo {current + 1} de {steps.length}
          </Text>
        </div>

        <Card style={{ borderRadius: '8px', border: '1px solid #f0f0f0', background: 'white' }}>
          {initialLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '100px 0',
              textAlign: 'center'
            }}>
              <Spin size="large" tip="Carregando seus dados..." />
              <Paragraph style={{ marginTop: '24px', color: '#595959' }}>
                Preparando sua experiência...
              </Paragraph>
            </div>
          ) : (
            <>
              <div style={{ padding: '24px 48px 40px' }}>
                <Steps current={current} titlePlacement="vertical">
                  {steps.map((item, index) => (
                    <Step
                      key={item.title}
                      title={item.title}
                      icon={
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: current >= index ? '#1890ff' : '#f0f0f0',
                          color: current >= index ? 'white' : '#999',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}>
                          {item.icon}
                        </div>
                      }
                      description={
                        <Text type={current >= index ? "primary" : "secondary"} style={{ fontSize: '12px' }}>
                          Passo {index + 1}
                        </Text>
                      }
                    />
                  ))}
                </Steps>
              </div>

              <div style={{ padding: '0 48px 40px', minHeight: '500px' }}>
                {steps[current].content}
              </div>

              <div style={{
                padding: '24px 48px',
                borderTop: '1px solid #f0f0f0',
                background: '#fafafa'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Button
                    size="large"
                    onClick={() => current === 0 ? navigate('/cliente/dashboard') : prev()}
                    style={{
                      padding: '0 24px',
                      height: '40px',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {current === 0 ? 'Voltar ao Dashboard' : 'Voltar'}
                  </Button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {current < steps.length - 1
                        ? 'Continue para o próximo passo'
                        : 'Revise e confirme a contratação'}
                    </Text>

                    {current < steps.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        icon={<ArrowRightOutlined />}
                        onClick={next}
                        disabled={
                          (current === 0 && !assetType) ||
                          (current === 1 && !selectedAsset) ||
                          (current === 2 && (!valorBem || valorBem <= 0)) ||
                          (current === 3 && !selectedSeguro)
                        }
                        style={{
                          padding: '0 32px',
                          height: '40px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          opacity: (
                            (current === 0 && !assetType) ||
                            (current === 1 && !selectedAsset) ||
                            (current === 2 && (!valorBem || valorBem <= 0)) ||
                            (current === 3 && !selectedSeguro)
                          ) ? 0.5 : 1
                        }}
                      >
                        Próximo Passo
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        icon={<SafetyCertificateFilled />}
                        onClick={handleContratar}
                        loading={loading}
                        style={{
                          padding: '0 32px',
                          height: '40px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        Confirmar Contratação
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

    </ClienteLayout>
  );
};

export default ContratarSeguroPage;