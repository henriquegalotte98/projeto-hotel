package br.com.jprog.hotel.controller;

import br.com.jprog.hotel.model.Hospede;
import br.com.jprog.hotel.service.HospedeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Valida os contratos HTTP expostos pelo controller de hóspedes. */
class HospedeControllerTest {

    private HospedeService service;
    private HospedeController controller;
    private Hospede hospede;

    @BeforeEach
    void preparar() {
        service = mock(HospedeService.class);
        controller = new HospedeController(service);
        hospede = new Hospede();
        hospede.setId(1L);
        hospede.setNome("Maria Silva");
        hospede.setCpf("12345678901");
        hospede.setEmail("maria@exemplo.com");
        hospede.setTelefone("11999999999");
    }

    @Test
    void deveListarComStatus200() {
        when(service.listar()).thenReturn(List.of(hospede));

        ResponseEntity<List<Hospede>> resposta = controller.listar();

        assertEquals(HttpStatus.OK, resposta.getStatusCode());
        assertEquals(List.of(hospede), resposta.getBody());
    }

    @Test
    void deveBuscarComStatus200() {
        when(service.buscar(1L)).thenReturn(hospede);

        ResponseEntity<Hospede> resposta = controller.buscar(1L);

        assertEquals(HttpStatus.OK, resposta.getStatusCode());
        assertEquals(hospede, resposta.getBody());
    }

    @Test
    void deveCriarComStatus201() {
        when(service.criar(hospede)).thenReturn(hospede);

        ResponseEntity<Hospede> resposta = controller.criar(hospede);

        assertEquals(HttpStatus.CREATED, resposta.getStatusCode());
        assertEquals(hospede, resposta.getBody());
    }

    @Test
    void deveAtualizarComStatus200() {
        when(service.atualizar(1L, hospede)).thenReturn(hospede);

        ResponseEntity<Hospede> resposta = controller.atualizar(1L, hospede);

        assertEquals(HttpStatus.OK, resposta.getStatusCode());
        assertEquals(hospede, resposta.getBody());
    }

    @Test
    void deveExcluirComStatus204ESemCorpo() {
        ResponseEntity<Void> resposta = controller.excluir(1L);

        assertEquals(HttpStatus.NO_CONTENT, resposta.getStatusCode());
        assertNull(resposta.getBody());
        verify(service).excluir(1L);
    }
}
