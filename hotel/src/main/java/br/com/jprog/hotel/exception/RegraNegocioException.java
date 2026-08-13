package br.com.jprog.hotel.exception;

/** Indica uma operação incompatível com as regras do domínio. */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
