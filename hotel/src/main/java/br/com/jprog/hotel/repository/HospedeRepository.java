package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Hospede;
import java.util.*;
import java.util.stream.Collectors;

public class HospedeRepository {
    
    private Map<Long, Hospede> hospedesMap = new HashMap<>();
    private Long currentId = 1L;
    
    // CRUD básico
    public Hospede save(Hospede hospede) {
        if (hospede.getId() == null) {
            hospede.setId(currentId++);
        }
        hospedesMap.put(hospede.getId(), hospede);
        return hospede;
    }
    
    public Hospede findById(Long id) {
        return hospedesMap.get(id);
    }
    
    public Hospede findByCpf(String cpf) {
        String cpfLimpo = cpf.replaceAll("[^0-9]", "");
        return hospedesMap.values().stream()
                .filter(h -> h.getCpf() != null && h.getCpf().equals(cpfLimpo))
                .findFirst()
                .orElse(null);
    }
    
    public Hospede findByEmail(String email) {
        return hospedesMap.values().stream()
                .filter(h -> h.getEmail() != null && h.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
    }
    
    public List<Hospede> findAll() {
        return new ArrayList<>(hospedesMap.values());
    }
    
    public List<Hospede> findAllActive() {
        return hospedesMap.values().stream()
                .filter(Hospede::isAtivo)
                .collect(Collectors.toList());
    }
    
    public void deleteById(Long id) {
        hospedesMap.remove(id);
    }
    
    public void delete(Hospede hospede) {
        hospedesMap.remove(hospede.getId());
    }
    
    // Métodos de busca
    public List<Hospede> findByNome(String nome) {
        return hospedesMap.values().stream()
                .filter(h -> h.getNome() != null && 
                             h.getNome().toLowerCase().contains(nome.toLowerCase()))
                .collect(Collectors.toList());
    }
    
    public List<Hospede> findByNomeExato(String nome) {
        return hospedesMap.values().stream()
                .filter(h -> h.getNome() != null && 
                             h.getNome().equalsIgnoreCase(nome))
                .collect(Collectors.toList());
    }
    
    public List<Hospede> findByTelefone(String telefone) {
        return hospedesMap.values().stream()
                .filter(h -> (h.getTelefone() != null && h.getTelefone().contains(telefone)) ||
                             (h.getCelular() != null && h.getCelular().contains(telefone)))
                .collect(Collectors.toList());
    }
    
    public List<Hospede> findByCidade(String cidade) {
        return hospedesMap.values().stream()
                .filter(h -> h.getCidade() != null && 
                             h.getCidade().equalsIgnoreCase(cidade))
                .collect(Collectors.toList());
    }
    
    public List<Hospede> findByEstado(String estado) {
        return hospedesMap.values().stream()
                .filter(h -> h.getEstado() != null && 
                             h.getEstado().equalsIgnoreCase(estado))
                .collect(Collectors.toList());
    }
    
    // Métodos de filtro
    public List<Hospede> filterByAtivo(boolean ativo) {
        return hospedesMap.values().stream()
                .filter(h -> h.isAtivo() == ativo)
                .collect(Collectors.toList());
    }
    
    public List<Hospede> filterByMaiorDeIdade(boolean maiorDeIdade) {
        return hospedesMap.values().stream()
                .filter(h -> h.isMaiorDeIdade() == maiorDeIdade)
                .collect(Collectors.toList());
    }
    
    public List<Hospede> filterByNecessidadeEspecial(boolean necessidadeEspecial) {
        return hospedesMap.values().stream()
                .filter(h -> h.isNecessidadeEspecial() == necessidadeEspecial)
                .collect(Collectors.toList());
    }
    
    // Métodos de validação
    public boolean existsByCpf(String cpf) {
        return findByCpf(cpf) != null;
    }
    
    public boolean existsByEmail(String email) {
        return findByEmail(email) != null;
    }
    
    public boolean existsById(Long id) {
        return hospedesMap.containsKey(id);
    }
    
    // Métodos de contagem
    public long count() {
        return hospedesMap.size();
    }
    
    public long countActive() {
        return findAllActive().size();
    }
    
    public long countByCidade(String cidade) {
        return findByCidade(cidade).size();
    }
    
    // Métodos de atualização em massa
    public void desativarTodos() {
        hospedesMap.values().forEach(h -> h.setAtivo(false));
    }
    
    public void ativarTodos() {
        hospedesMap.values().forEach(h -> h.setAtivo(true));
    }
    
    // Método para limpar repositório
    public void clear() {
        hospedesMap.clear();
        currentId = 1L;
    }
    
    // Método para obter todos os IDs
    public Set<Long> getAllIds() {
        return new HashSet<>(hospedesMap.keySet());
    }
    
    // Método para buscar por múltiplos critérios
    public List<Hospede> search(String nome, String cpf, String email, String telefone) {
        return hospedesMap.values().stream()
                .filter(h -> {
                    boolean match = true;
                    if (nome != null && !nome.isEmpty()) {
                        match = match && h.getNome() != null && 
                                h.getNome().toLowerCase().contains(nome.toLowerCase());
                    }
                    if (cpf != null && !cpf.isEmpty()) {
                        match = match && h.getCpf() != null && 
                                h.getCpf().contains(cpf.replaceAll("[^0-9]", ""));
                    }
                    if (email != null && !email.isEmpty()) {
                        match = match && h.getEmail() != null && 
                                h.getEmail().toLowerCase().contains(email.toLowerCase());
                    }
                    if (telefone != null && !telefone.isEmpty()) {
                        match = match && ((h.getTelefone() != null && h.getTelefone().contains(telefone)) ||
                                         (h.getCelular() != null && h.getCelular().contains(telefone)));
                    }
                    return match;
                })
                .collect(Collectors.toList());
    }
}
