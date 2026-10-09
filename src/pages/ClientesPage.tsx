import { useEffect, useState } from 'react';
import type { Cliente } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

const emptyClienteForm = { nome: '', cpf: '' };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(emptyClienteForm);
  const [error, setError] = useState('');

  const loadClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar clientes.');
      }
      setClientes(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar clientes.');
    }
  };

  useEffect(() => {
    void loadClientes();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
      };

      const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.mensagem ?? 'Não foi possível cadastrar o cliente.');
      }

      setForm(emptyClienteForm);
      await loadClientes();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.');
    }
  };

  return (
    <div className="page-block">
      <div className="page-header">
        <div>
          <p className="section-kicker">Cadastro</p>
          <h1>Clientes</h1>
        </div>
      </div>

      {error ? <div className="alert-box">{error}</div> : null}

      <div className="panel-grid single-col">
        <div className="panel-card">
          <div className="panel-header">
            <h2>Novo cliente</h2>
          </div>
          <form onSubmit={handleSubmit} className="stack-form">
            <label>
              Nome
              <input
                value={form.nome}
                onChange={(event) => setForm((state) => ({ ...state, nome: event.target.value }))}
                placeholder="Ex: Ana Paula"
              />
            </label>
            <label>
              CPF
              <input
                value={form.cpf}
                onChange={(event) => setForm((state) => ({ ...state, cpf: event.target.value }))}
                placeholder="000.000.000-00"
              />
            </label>
            <button type="submit" className="primary-button">
              Cadastrar cliente
            </button>
          </form>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h2>Lista de clientes</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.idCliente ?? cliente.cpf}>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
