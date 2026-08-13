package br.com.jprog.hotel.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

	public Map<String, Object> resumo(LocalDate inicio, LocalDate fim) {
		// Implementação inicial: retorna mapa vazio. Preencha com lógica real conforme necessário.
		return new HashMap<>();
	}

}
