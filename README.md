# 🏨 Projeto Hotel

Sistema web para **gestão hoteleira**, desenvolvido com **Java e Spring Boot**, com o objetivo de centralizar e facilitar o gerenciamento das principais operações de um hotel.

O sistema possui recursos relacionados a **reservas, hóspedes, quartos, governança, manutenção, usuários e relatórios**, além de autenticação e controle de acesso.

---

## 📌 Sobre o projeto

O **Projeto Hotel** foi desenvolvido como uma aplicação completa de gerenciamento hoteleiro, permitindo organizar diferentes setores e processos presentes na rotina de um hotel.

A aplicação possui uma arquitetura baseada em camadas, separando responsabilidades entre:

- Controllers
- Services
- Repositories
- Entities
- DTOs
- Configurações de segurança

---

## 🚀 Funcionalidades

- 🔐 Autenticação de usuários
- 👤 Gerenciamento de usuários
- 🧑 Gerenciamento de hóspedes
- 🛏️ Gerenciamento de quartos
- 📅 Gerenciamento de reservas
- ✅ Check-in e check-out
- 🧹 Controle de governança
- 🔧 Controle de manutenção
- 🛎️ Registro de consumos extras
- 📊 Dashboard
- 📈 Relatórios

---

## 🛠️ Tecnologias utilizadas

### Backend

![Java](https://img.shields.io/badge/Java-21-blue?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.7-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Hibernate](https://img.shields.io/badge/Hibernate-JPA-59666C?style=for-the-badge&logo=hibernate)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)

### Banco de dados

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### Frontend

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🧩 Principais módulos

### 🔐 Autenticação

Responsável pelo login e controle de acesso dos usuários ao sistema.

### 👤 Usuários

Gerenciamento dos usuários responsáveis por acessar e operar o sistema.

### 🧑 Hóspedes

Cadastro e gerenciamento das informações dos hóspedes.

### 🛏️ Quartos

Gerenciamento dos quartos disponíveis no hotel, incluindo suas informações e status.

### 📅 Reservas

Controle das reservas realizadas pelos hóspedes.

### 🧹 Governança

Gerenciamento das atividades relacionadas à organização e limpeza dos quartos.

### 🔧 Manutenção

Registro e acompanhamento das necessidades de manutenção dos quartos e instalações.

### 🛎️ Consumos extras

Registro de produtos ou serviços adicionais utilizados durante a hospedagem.

### 📊 Dashboard

Apresentação de informações importantes do hotel de forma centralizada.

### 📈 Relatórios

Consulta de informações e indicadores relacionados às operações do hotel.

---

## 📂 Estrutura do projeto

```text
projeto-hotel/
│
├── data/
│
└── hotel/
    │
    ├── .mvn/
    ├── data/
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── br/com/jprog/hotel/
    │   │   │       ├── config/
    │   │   │       ├── controller/
    │   │   │       ├── dto/
    │   │   │       ├── entity/
    │   │   │       ├── repository/
    │   │   │       ├── service/
    │   │   │       └── HotelApplication.java
    │   │   │
    │   │   └── resources/
    │   │
    │   └── test/
    │
    ├── pom.xml
    ├── mvnw
    └── mvnw.cmd
```

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

- Java 21
- MySQL
- Git

O projeto utiliza o **Maven Wrapper**, portanto não é obrigatório possuir o Maven instalado globalmente.

---

## 📥 Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/omendesx/projeto-hotel.git
```

### 2. Acesse a pasta

```bash
cd projeto-hotel/hotel
```

### 3. Configure o banco de dados

Crie um banco MySQL:

```sql
CREATE DATABASE hotelweb;
```

Configure a conexão no arquivo de propriedades da aplicação:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel
spring.datasource.username=root
spring.datasource.password=sua_senha
```

### 4. Execute a aplicação

#### Windows

```bash
mvnw.cmd spring-boot:run
```

#### Linux/macOS

```bash
./mvnw spring-boot:run
```

Ou, caso possua Maven instalado:

```bash
mvn spring-boot:run
```

---

## 🌐 Acessando o sistema

Após iniciar a aplicação, acesse:

```text
http://localhost:8080
```

---

## 🏗️ Arquitetura

O backend segue uma arquitetura em camadas:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

- **Controller:** recebe e responde às requisições HTTP.
- **Service:** contém as regras de negócio.
- **Repository:** realiza a comunicação com o banco através do Spring Data JPA.
- **Entity:** representa as entidades armazenadas no banco.
- **DTO:** transporta dados entre as diferentes camadas.

---

## 🎯 Objetivo

O projeto tem como objetivo aplicar na prática conceitos como:

- Desenvolvimento de APIs REST
- Arquitetura em camadas
- Programação Orientada a Objetos
- Spring Boot
- Banco de dados relacional
- Autenticação e autorização
- Validação de dados
- Integração entre frontend e backend
- Git e GitHub

---

## 📄 Licença

Este projeto foi desenvolvido para fins de estudo e aprendizado.

---

<p align="center">
  Desenvolvido com ☕ Java e Spring Boot
</p>
