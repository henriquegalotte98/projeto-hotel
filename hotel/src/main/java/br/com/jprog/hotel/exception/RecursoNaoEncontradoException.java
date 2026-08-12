package br.com.jprog.hotel.exception;

/** Indica que um recurso solicitado não existe. */
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
