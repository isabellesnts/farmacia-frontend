import { useEffect, useState } from 'react';
import type { Cliente, ItemPedidoForm, PedidoDetalhado, PedidoResumo, Produto } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
const emptyItemForm = { idProduto: '', qtdProduto: '', precoUnit: '' };

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = value.includes('T') ? value.split('T')[0] : value;
  return new Date(date).toLocaleDateString('pt-BR');
};

export default function PedidosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoDetalhado | null>(null);
  const [pedidoIdCliente, setPedidoIdCliente] = useState('');
  const [pedidoItens, setPedidoItens] = useState<ItemPedidoForm[]>([emptyItemForm]);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [clientesResponse, produtosResponse, pedidosResponse] = await Promise.all([
        fetch(`${API_URL}/clientes`),
        fetch(`${API_URL}/produtos`),
        fetch(`${API_URL}/pedidos`),
      ]);

      if (!clientesResponse.ok || !produtosResponse.ok || !pedidosResponse.ok) {
        throw new Error('Não foi possível carregar os dados de vendas.');
      }

      setClientes(await clientesResponse.json());
      setProdutos(await produtosResponse.json());
      setPedidos(await pedidosResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos.');
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openPedido = async (idVenda: number) => {
    try {
      const response = await fetch(`${API_URL}/pedidos/${idVenda}`);
      if (!response.ok) {
        throw new Error('Não foi possível abrir o pedido.');
      }
      setPedidoSelecionado(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir pedido.');
    }
  };

  const handlePedidoItemChange = (
    index: number,
    field: keyof ItemPedidoForm,
    value: string,
  ) => {
    const items = [...pedidoItens];
    items[index] = { ...items[index], [field]: value };

    if (field === 'idProduto' && value) {
      const produtoSelecionado = produtos.find(
        (produto) => String(produto.idProduto) === value,
      );

      if (produtoSelecionado) {
        items[index].precoUnit = String(produtoSelecionado.preco);
      }
    }

    setPedidoItens(items);
  };

  const handleAddItem = () => {
    setPedidoItens((state) => [...state, { ...emptyItemForm }]);
  };

  const handleRemoveItem = (index: number) => {
    setPedidoItens((state) => {
      if (state.length === 1) return [emptyItemForm];
      return state.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const itens = pedidoItens
        .filter((item) => item.idProduto && item.qtdProduto)
        .map((item) => {
          const produtoSelecionado = produtos.find(
            (produto) => String(produto.idProduto) === item.idProduto,
          );

          return {
            idProduto: Number(item.idProduto),
            qtdProduto: Number(item.qtdProduto),
            precoUnit: Number(item.precoUnit || produtoSelecionado?.preco || 0),
          };
        });

      if (!pedidoIdCliente || itens.length === 0) {
        throw new Error('Selecione um cliente e adicione pelo menos um item.');
      }

      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCliente: Number(pedidoIdCliente), itens }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.mensagem ?? 'Erro ao registrar pedido.');
      }

      setPedidoIdCliente('');
      setPedidoItens([emptyItemForm]);
      setError('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar venda.');
    }
  };

  const totalPedido = pedidoSelecionado
    ? pedidoSelecionado.itens.reduce((acc, item) => acc + item.qtdProduto * item.precoUnit, 0)
    : 0;

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <p className="section-kicker">Operações</p>
          <h1>Pedidos</h1>
        </div>
      </div>

      {error ? <div className="alert-box">{error}</div> : null}

      <div className="panel-grid pedidos-grid">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Nova venda</h2>
          </div>
          <form onSubmit={handleSubmit} className="stack-form">
            <label>
              Cliente
              <select value={pedidoIdCliente} onChange={(event) => setPedidoIdCliente(event.target.value)}>
                <option value="">Selecione</option>
                {clientes.map((cliente) => (
                  <option key={cliente.idCliente ?? cliente.cpf} value={cliente.idCliente}>
                    {cliente.nome} • {cliente.cpf}
                  </option>
                ))}
              </select>
            </label>

            {pedidoItens.map((item, index) => (
              <div key={index} className="order-item">
                <select
                  value={item.idProduto}
                  onChange={(event) => handlePedidoItemChange(index, 'idProduto', event.target.value)}
                >
                  <option value="">Produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.idProduto} value={produto.idProduto}>
                      {produto.descricao}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Qtd"
                  value={item.qtdProduto}
                  onChange={(event) => handlePedidoItemChange(index, 'qtdProduto', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Preço"
                  value={item.precoUnit}
                  onChange={(event) => handlePedidoItemChange(index, 'precoUnit', event.target.value)}
                />
                <button type="button" className="ghost-button small" onClick={() => handleRemoveItem(index)}>
                  Remover
                </button>
              </div>
            ))}

            <div className="button-row">
              <button type="button" className="secondary-button" onClick={handleAddItem}>
                + Adicionar item
              </button>
              <button type="submit" className="primary-button">
                Finalizar venda
              </button>
            </div>
          </form>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h2>Pedidos registrados</h2>
          </div>
          <div className="list-stack">
            {pedidos.map((pedido) => (
              <button type="button" key={pedido.idVenda} className="mini-card" onClick={() => openPedido(pedido.idVenda)}>
                <div>
                  <strong>#{pedido.idVenda}</strong>
                  <span>{pedido.nomeCliente}</span>
                </div>
                <small>{formatDate(pedido.dataVenda)}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card detail-panel">
        <div className="panel-header">
          <h2>Detalhes do pedido</h2>
        </div>
        {pedidoSelecionado ? (
          <>
            <div className="detail-header">
              <div>
                <p className="section-kicker">Pedido #{pedidoSelecionado.pedido.idVenda}</p>
                <h3>{pedidoSelecionado.pedido.nomeCliente}</h3>
              </div>
              <span className="total-pill">{currency(totalPedido)}</span>
            </div>
            <ul className="detail-list">
              {pedidoSelecionado.itens.map((item) => (
                <li key={`${item.idProduto}-${item.descricao}`}>
                  <div>
                    <strong>{item.descricao}</strong>
                    <span>
                      {item.qtdProduto} x {currency(item.precoUnit)}
                    </span>
                  </div>
                  <b>{currency(item.qtdProduto * item.precoUnit)}</b>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="empty-state">Selecione um pedido para ver os itens.</p>
        )}
      </div>
    </div>
  );
}
