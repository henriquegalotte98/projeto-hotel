package br.com.jprog.hotel.dto;

/** Dados públicos do usuário autenticado, identificado globalmente pelo CPF. */
public record LoginResponse(String nome, String cpf, String papel) {}
