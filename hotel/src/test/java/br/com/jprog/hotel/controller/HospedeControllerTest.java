package br.com.jprog.hotel.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.com.jprog.hotel.model.Hospede;
import br.com.jprog.hotel.service.HospedeService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;

class HospedeControllerTest {
    HospedeService service;
    HospedeController controller;
    Hospede hospede;

    @BeforeEach void preparar() {
        service = mock(HospedeService.class);
        controller = new HospedeController(service);
        hospede = new Hospede("Maria Silva", "12345678901", "11999999999");
    }

    @Test void deveListarComStatus200() {
        when(service.listar()).thenReturn(List.of(hospede));
        assertEquals(List.of(hospede), controller.listar().getBody());
    }

    @Test void deveBuscarPorCpfComStatus200() {
        when(service.buscar(hospede.getCpf())).thenReturn(hospede);
        ResponseEntity<Hospede> resposta = controller.buscar(hospede.getCpf());
        assertEquals(HttpStatus.OK, resposta.getStatusCode());
        assertEquals(hospede, resposta.getBody());
    }

    @Test void deveCriarComStatus201() {
        when(service.criar(hospede)).thenReturn(hospede);
        assertEquals(HttpStatus.CREATED, controller.criar(hospede).getStatusCode());
    }

    @Test void deveAtualizarPorCpfComStatus200() {
        when(service.atualizar(hospede.getCpf(), hospede)).thenReturn(hospede);
        assertEquals(hospede, controller.atualizar(hospede.getCpf(), hospede).getBody());
    }

    @Test void deveExcluirPorCpfComStatus204() {
        ResponseEntity<Void> resposta = controller.excluir(hospede.getCpf());
        assertEquals(HttpStatus.NO_CONTENT, resposta.getStatusCode());
        assertNull(resposta.getBody());
        verify(service).excluir(hospede.getCpf());
    }
}
