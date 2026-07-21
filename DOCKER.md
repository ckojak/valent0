# Rodando local com Docker

Este projeto pode ser executado sem instalar Node.js ou Bun na sua maquina.

## 1) Configure o ambiente

Preencha o arquivo `.env` com as credenciais da Segfy:

- `SEGFY_CLIENT_ID`
- `SEGFY_SECRET_ID`
- `SEGFY_CALCULATE_TOKEN` (se exigido no seu tenant)

A URL base ja esta definida como:

- `SEGFY_API_BASE_URL=https://api.automation.segfy.com`

## 2) Suba o app em modo desenvolvimento

```bash
docker compose up --build
```

Aplicacao disponivel em:

- `http://localhost:5173`

## 3) Parar os containers

```bash
docker compose down
```

## Dicas

- Hot reload esta habilitado.
- Se trocar dependencias do `package.json`, rode novamente com `--build`.
- O ambiente de desenvolvimento instala dependencias sem lock congelado para evitar quebra por lockfile desatualizado.
- Se quiser limpar cache/volumes:

```bash
docker compose down -v
docker compose up --build
```
