# Sorteio das Divisões - CAGE-RS

Este é um WebApp criado para gerenciar o sorteio das divisões dos auditores da CAGE-RS, incluindo um sistema de bolão onde participantes podem fazer palpites sobre as escolhas.

## 🚀 Como Executar o Código

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação e Execução

1. **Navegue para o diretório do projeto:**
   ```bash
   cd my-app
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse o aplicativo:**
   - Abra seu navegador e vá para `http://localhost:5173` (ou a porta indicada no terminal)

## 🎯 Funcionalidades Principais

### 1. **Sistema de Escolha de Divisões**
- Interface visual com cards para cada auditor
- Seleção de divisão através de dropdown
- Confirmação e edição de escolhas
- Barra de progresso mostrando quantos auditores já foram escolhidos

### 2. **Sistema de Bolão/Palpites**
- Ranking em tempo real dos participantes
- Cálculo automático de pontos baseado em acertos
- Exibição de mudanças de posição no ranking
- Top 5 participantes sempre visível

### 3. **Sistema de Busca**
- Busca por nome do auditor
- Filtros dinâmicos
- Contador de resultados

### 4. **Reset de Dados**
- Botão para resetar todas as escolhas
- Recarregamento automático dos dados originais

## 🏆 Como o Vencedor é Calculado

### Sistema de Pontuação
- **1 ponto** por acerto: Quando a divisão escolhida para um auditor coincide com o palpite de um participante
- **0 pontos** por erro: Quando não há correspondência entre escolha e palpite

### Exemplo de Cálculo
```
Participante: João Silva
Palpite para "Aline de Melo Vilela": "DCD"
Escolha real para "Aline de Melo Vilela": "DCD"
Resultado: João Silva ganha +1 ponto ✅

Palpite para "André Silva de França": "DCI" 
Escolha real para "André Silva de França": "Contabilidade"
Resultado: João Silva ganha 0 pontos ❌
```

### Ranking
- Ordenado por **maior número de pontos**
- Atualizado em **tempo real** conforme as escolhas são feitas
- Exibe **top 5** participantes
- Mostra **mudanças de posição** (subiu, desceu, novo)

## 📊 Esquemas dos Arquivos CSV

### 1. **employees.csv** (Localização: `public/data/employees.csv`)

**Estrutura:**
```csv
id,name,department,photo
1,Aline de Melo Vilela,Oculto,aline.jpg
2,André Silva de França,Motor V12,andre.jpg
...
```

**Colunas:**
- `id`: Identificador único do auditor (número)
- `name`: Nome completo do auditor
- `department`: Departamento/função do auditor
- `photo`: Nome do arquivo da foto (deve estar em `public/photos/`)

### 2. **guesses.csv** (Localização: `public/data/guesses.csv`)

**Estrutura:**
```csv
Carimbo de data/hora,NOME COMPLETO,ALINE DE MELO VILELA,ANDRÉ SILVA DE FRANÇA,BRUNO DIAS PEREIRA,...
16/09/2025 12:06:16,Gustavo de Oliveira Rezende,DCD,DCI,DCI,...
16/09/2025 17:24:08,Edison Weber Woycinck,DCI,DCD,DCI,...
...
```

**Colunas:**
- `Carimbo de data/hora`: Timestamp da submissão do palpite
- `NOME COMPLETO`: Nome do participante do bolão
- `[NOME DO AUDITOR]`: Uma coluna para cada auditor em MAIÚSCULAS (30 colunas)
- **Valores possíveis para cada auditor:**
  - `DCD`
  - `DCI`
  - `Contabilidade`
  - `Transparência`
  - `Orientação`
  - `Apuração e Combate à Corrupção`
  - `DIE`
  - `DTI`
  - `Projetos e Processos`

## 📁 Localização dos Arquivos

### Estrutura de Diretórios
```
my-app/
├── public/
│   ├── data/
│   │   ├── employees.csv      ← Dados dos auditores
│   │   └── guesses.csv        ← Palpites dos participantes
│   └── photos/
│       ├── aline.jpg          ← Fotos dos auditores
│       ├── andre.jpg
│       └── ...
├── src/
│   ├── components/
│   ├── utils/
│   └── ...
└── README.md
```

### Onde Colocar os CSVs
- **employees.csv**: `my-app/public/data/employees.csv`
- **guesses.csv**: `my-app/public/data/guesses.csv`
- **Fotos**: `my-app/public/photos/` (nomes devem coincidir com a coluna `photo`)

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```


## 📝 Notas Importantes

- O sistema salva as escolhas no **localStorage** do navegador
- Para resetar completamente, use o botão "🔄 Reset Database"
- As fotos dos auditores devem estar no formato JPG e na pasta `public/photos/`
- O sistema suporta até 30 auditores e quantos participantes quiserem no bolão