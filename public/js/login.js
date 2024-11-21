async function logon() {
    // Obtém o formulário de login pela ID 'loginForm'
    const form = document.getElementById('loginForm');
    
    try {
        // Envia uma requisição HTTP POST para a rota '/login' usando os dados do formulário
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form)) // Converte os dados do formulário para o formato de URL
        });

        // Converte a resposta do servidor para JSON
        const result = await response.json();
        console.log(result); // Loga o resultado da resposta no console para depuração

        // Verifica se o login foi bem-sucedido
        if (result.success) {
            if (result.isAnalista) {
                // Redireciona o usuário específico para 'analista.html'
                window.location.href = '/analista.html';
            } else {
                // Redireciona os demais usuários para 'index.html'
                window.location.href = '/index.html';
            }
        } else {
            // Exibe uma mensagem de erro se o login falhar
            alert(result.message || 'Falha no login.');
        }
    } catch (error) {
        // Se ocorrer algum erro durante a requisição, loga o erro no console e exibe um alerta
        console.error('Erro ao tentar fazer login:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}
