import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message, Space, Divider, Switch, DatePicker } from 'antd';
import { PlusOutlined, MinusCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import seguroService from '../../../services/seguroService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CriarSeguro = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [usaValor, setUsaValor] = useState(false);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await seguroService.listarCategorias();
      setCategorias(response || []);
    } catch (error) {
      message.error('Erro ao carregar categorias');
    }
  };

  const handleCategoriaChange = (idCategoria) => {
    form.setFieldValue('id_tipo_seguro', null);
    const categoria = categorias.find(c => c.id_categoria === idCategoria);
    if (categoria && categoria.tipos) {
      setTiposDisponiveis(categoria.tipos);
    } else {
      setTiposDisponiveis([]);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Formatar datas se existirem
      if (values.preco) {
        if (values.preco.data_inicio) {
          values.preco.data_inicio = values.preco.data_inicio.format('YYYY-MM-DD');
        }
        if (values.preco.data_fim) {
          values.preco.data_fim = values.preco.data_fim.format('YYYY-MM-DD');
        }
        // Garante que só envia o campo correto de prêmio
        if (values.preco.usaValor) {
          // Se usa valor fixo, remove percentagem e exige premio_valor
          delete values.preco.premio_percentagem;
          if (values.preco.premio_valor === undefined || values.preco.premio_valor === null) {
            message.error('Informe o Prêmio Valor Fixo!');
            setLoading(false);
            return;
          }
        } else {
          // Se usa percentagem, remove valor fixo e exige premio_percentagem
          delete values.preco.premio_valor;
          if (values.preco.premio_percentagem === undefined || values.preco.premio_percentagem === null) {
            message.error('Informe o Prêmio Percentagem!');
            setLoading(false);
            return;
          }
        }
      }

      await seguroService.criarSeguro(values);
      message.success('Seguro criado com sucesso!');
      navigate('/seguradora/seguros');
    } catch (error) {
      message.error(error.message || 'Erro ao criar seguro');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/seguradora/seguros')}
            style={{ marginBottom: '16px' }}
          >
            Voltar
          </Button>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Criar Novo Seguro</h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: true,
            auto_aprovacao: false,
            preco: {
              usaValor: false
            }
          }}
        >
          {/* Informações Básicas */}
          <Divider orientation="left">Informações Básicas</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Form.Item
              label="Categoria"
              name="id_categoria"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Select
                placeholder="Selecione uma categoria"
                onChange={handleCategoriaChange}
              >
                {categorias.map(cat => (
                  <Option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.descricao}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Tipo de Seguro"
              name="id_tipo_seguro"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Select placeholder="Selecione o tipo" disabled={!tiposDisponiveis.length}>
                {tiposDisponiveis.map(tipo => (
                  <Option key={tipo.id} value={tipo.id}>
                    {tipo.descricao}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Nome do Seguro"
            name="nome"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input placeholder="Ex: Seguro Auto Premium" />
          </Form.Item>

          <Form.Item
            label="Descrição"
            name="descricao"
          >
            <TextArea rows={3} placeholder="Descreva o seguro..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

            <Form.Item
              label="Prêmio Mínimo (MZN)"
              name="premio_minimo"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={100}
                placeholder="0.00"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              label="Valor Mínimo Dano (MZN)"
              name="valor_minimo_dano"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={100}
                placeholder="0.00"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Form.Item
              label="Status"
              name="status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>

            <Form.Item
              label="Auto-Aprovação"
              name="auto_aprovacao"
              valuePropName="checked"
              tooltip="Se ativado, as propostas dos clientes serão aprovadas automaticamente sem análise prévia."
            >
              <Switch checkedChildren="Ligado" unCheckedChildren="Desligado" />
            </Form.Item>
          </div>

          {/* Preço Inicial */}
          <Divider orientation="left">Preço Inicial (Opcional)</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Form.Item
              label="Usar Valor Fixo?"
              name={['preco', 'usaValor']}
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Sim"
                unCheckedChildren="Não"
                onChange={setUsaValor}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Form.Item
              label="Prêmio Percentagem (%)"
              name={['preco', 'premio_percentagem']}
              hidden={usaValor}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                step={0.5}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              label="Prêmio Valor Fixo (MZN)"
              name={['preco', 'premio_valor']}
              hidden={!usaValor}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={100}
                placeholder="0.00"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              label="Data Início"
              name={['preco', 'data_inicio']}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="Data Fim"
              name={['preco', 'data_fim']}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          {/* Coberturas */}
          <Divider orientation="left">Coberturas (Opcional)</Divider>

          <Form.List name="coberturas">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: '16px', background: '#f9fafb' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      >
                        Remover
                      </Button>
                    }
                  >
                    <Form.Item
                      {...restField}
                      label="Descrição da Cobertura"
                      name={[name, 'descricao']}
                      rules={[{ required: true, message: 'Campo obrigatório' }]}
                    >
                      <TextArea rows={2} placeholder="Ex: Cobertura contra roubo e furto" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <Form.Item
                        {...restField}
                        label="Franquia (%)"
                        name={[name, 'franquia']}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          max={100}
                          step={0.1}
                          placeholder="0.00"
                          suffix="%"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Valor Mínimo (MZN)"
                        name={[name, 'valor_minimo']}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          step={100}
                          placeholder="0.00"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: '24px' }}
                >
                  Adicionar Cobertura
                </Button>
              </>
            )}
          </Form.List>

          {/* Botões */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#1e40af' }}>
                Criar Seguro
              </Button>
              <Button onClick={() => navigate('/seguradora/seguros')}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CriarSeguro;
