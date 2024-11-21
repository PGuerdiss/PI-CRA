async function carregarItens() {
    try {
        const response = await fetch('/api/postagens');
        const postagens = await response.json();

        const container = document.getElementById('itens-container');
        container.innerHTML = '';

        postagens.forEach(post => {
            // Construir o HTML da postagem
            let itemHTML = `
                <a href="detalhes.html?cd_postagem=${post.cd_postagem}">
                    <div class="item">
                        <b><span id="titulo">VOCÊ ME VIU?</span></b>
                        <img src="${post.foto}" alt="Foto de ${post.nome}" class="img-item">
                        <span id="desc"><b>Nome:</b> ${post.nome}</span>
                        <span id="desc"><b>Idade:</b> ${post.idade}</span>
                        <span id="desc"><b>Última Localidade:</b> ${post.ultima_localidade}</span>
                    </div>
                </a>`;

            // Adicionar botão de exclusão apenas na página analista.html
            if (window.location.pathname.includes('analista.html')) {
                itemHTML += `
                    <button onclick="reprovarPostagem(${post.cd_postagem})" class="btn-excluir">
                        Reprovar
                    </button>`;
            }

            container.innerHTML += itemHTML;
        });
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
    }
}

// Função para excluir uma postagem pelo ID
async function reprovarPostagem(cd_postagem) {
    try {
        const response = await fetch(`/api/reprovarPostagem/${cd_postagem}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (result.success) {
            alert('Postagem reprovada com sucesso.');
            await carregarItens();  // Atualiza a lista de postagens
        } else {
            alert('Erro ao reprovar postagem.');
        }
    } catch (error) {
        console.error('Erro ao reprovar postagem:', error);
    }
}

// Carregar as postagens ao carregar a página
window.onload = carregarItens;