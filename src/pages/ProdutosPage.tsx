import { useEffect, useState } from 'react';
import type { Produto } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

const emptyProdutoForm = {
  descricao: '',
  preco: '',
  qtdEstoque: '',
  qtdMinEstoque: '',
  validade: '',
};

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = value.includes('T') ? value.split('T')[0] : value;
  return new Date(date).toLocaleDateString('pt-BR');
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState(emptyProdutoForm);
  const [error, setError] = useState('');

  const loadProdutos = async () => {
    try {
      const response = await fetch(`${API_URL}/produtos`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar produtos.');
      }
      setProdutos(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar produtos.');
    }
  };

  useEffect(() => {
    void loadProdutos();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload = {
        descricao: form.descricao.trim(),
        preco: Number(form.preco),
        qtdEstoque: Number(form.qtdEstoque),
        qtdMinEstoque: Number(form.qtdMinEstoque),
        validade: form.validade || null,
      };

      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.mensagem ?? 'Não foi possível cadastrar o produto.');
      }

      setForm(emptyProdutoForm);
      await loadProdutos();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar produto.');
    }
  };

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <p className="section-kicker">Estoque</p>
          <h1>Produtos</h1>
        </div>
      </div>

      {error ? <div className="alert-box">{error}</div> : null}

      <div className="panel-grid single-col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Novo produto</h2>
          </div>
          <form onSubmit={handleSubmit} className="stack-form">
            <label>
              Descrição
              <input
                value={form.descricao}
                onChange={(event) => setForm((state) => ({ ...state, descricao: event.target.value }))}
                placeholder="Paracetamol 750mg"
              />
            </label>
            <div className="two-columns">
              <label>
                Preço
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.preco}
                  onChange={(event) => setForm((state) => ({ ...state, preco: event.target.value }))}
                />
              </label>
              <label>
                Quantidade em estoque
                <input
                  type="number"
                  min="0"
                  value={form.qtdEstoque}
                  onChange={(event) => setForm((state) => ({ ...state, qtdEstoque: event.target.value }))}
                />
              </label>
            </div>
            <div className="two-columns">
              <label>
                Estoque mínimo
                <input
                  type="number"
                  min="0"
                  value={form.qtdMinEstoque}
                  onChange={(event) => setForm((state) => ({ ...state, qtdMinEstoque: event.target.value }))}
                />
              </label>
              <label>
                Validade
                <input
                  type="date"
                  value={form.validade}
                  onChange={(event) => setForm((state) => ({ ...state, validade: event.target.value }))}
                />
              </label>
            </div>
            <button type="submit" className="primary-button">
              Salvar produto
            </button>
          </form>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h2>Estoque atual</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Mínimo</th>
              <th>Validade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.idProduto} className={produto.emAlerta ? 'danger-row' : ''}>
                <td>{produto.descricao}</td>
                <td>{currency(produto.preco)}</td>
                <td>{produto.qtdEstoque}</td>
                <td>{produto.qtdMinEstoque}</td>
                <td>{formatDate(produto.validade)}</td>
                <td>
                  <span className={`status-badge ${produto.emAlerta ? 'warning' : 'ok'}`}>
                    {produto.emAlerta ? 'Crítico' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
