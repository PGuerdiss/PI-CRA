// Importa os módulos necessários para o funcionamento do servidor e manipulação de dados.
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); 
const multer = require('multer');
const session = require('express-session');

// Configuração do body-parser para interpretar dados enviados em formulários HTML (urlencoded e JSON).
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do multer para armazenamento de arquivos (usado para uploads de imagens).
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Define o diretório de destino dos uploads.
    },
    filename: (req, file, cb) => {
        // Gera um nome único para cada arquivo com base na data atual.
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage }); // Cria uma instância do multer com a configuração de armazenamento.

// Permite que o servidor sirva arquivos estáticos da pasta 'public/uploads'.
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rotas para enviar arquivos HTML para o cliente ao acessar URLs específicas.
app.get('/postagem.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'postagem.html'));
});

app.get('/aprovar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'aprovar.html'));
});

app.get('/aprovar.html', (req, res) => {
    if (!req.session.usuario || req.session.usuario.email !== 'AnalistaCRA@gmail.com') {
        return res.status(403).send('Acesso negado.'); // Redirecionar ou exibir mensagem de acesso negado
    }
    res.sendFile(path.join(__dirname, 'views', 'aprovar.html'));
});

app.get('/analista.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'analista.html'));
});

app.get('/detalhes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'detalhes.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/cadastro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastro.html'));
});

// Redireciona o usuário para a página inicial ao acessar a rota raiz ('/').
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/sobre.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'sobre.html'));
})
app.get('/apoia-se.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'apoia-se.html'));
})

// Configuração de sessões, usada para manter o estado de login dos usuários.
app.use(session({
    secret: 'seu-segredo-aqui', // Chave secreta para criptografar a sessão.
    resave: false, // Não regrava a sessão se nada for modificado.
    saveUninitialized: false // Não cria uma nova sessão até que algo seja armazenado.
}));

// Configuração da conexão com o banco de dados MySQL.
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'cra'
});

// Estabelece a conexão com o banco de dados e exibe uma mensagem de erro ou sucesso.
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ' + err.stack);
        return;
    }
    console.log('Conectado ao banco de dados.');
});

// Define a pasta 'public' como fonte de arquivos estáticos.
app.use(express.static(path.join(__dirname, 'public')));

// Rota para cadastrar um novo usuário.
app.post('/cadastrar', upload.single('foto'), (req, res) => {
    // Extrai os dados do formulário enviado pelo cliente.
    const { nome, cpf, telefone, email, senha } = req.body;
    // Se o upload de foto foi feito, armazena o caminho da foto; caso contrário, define como null.
    const foto_perfil = req.file ? `/uploads/${req.file.filename}` : null;

    // Importa o módulo de acesso ao banco de dados.
    const dao = require('./public/js/dao.js');

    // Chama o método para gravar o usuário no banco de dados.
    dao.gravarUsuario(nome, cpf, telefone, email, senha, foto_perfil, (err, results) => {
        if (err) {
            console.error('Erro ao gravar o usuário:', err);
            return res.status(500).send('Erro ao cadastrar usuário.');
        }
        res.redirect('/'); // Redireciona para a página inicial após o cadastro.
    });
});

// Rota para cadastrar uma nova postagem.
app.post('/cadastrarPostagem', upload.single('foto'), (req, res) => {
    // Extrai os dados da postagem enviados pelo cliente.
    const { nome, idade, ultima_localidade, data, informacoes_adicionais } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    const dao = require('./public/js/dao.js');

    // Chama o método para gravar a postagem no banco de dados.
    dao.gravarPostagem(nome, idade, ultima_localidade, data, informacoes_adicionais, foto, (err) => {
        if (err) {
            console.error('Erro ao gravar a postagem:', err);
            return res.status(500).send('Erro ao cadastrar postagem.');
        }
        res.redirect('/'); // Redireciona para a página inicial após o cadastro.
    });
});

// Rota para obter todas as postagens do banco de dados como JSON.
app.get('/api/postagens', (req, res) => {
    const dao = require('./public/js/dao.js');

    // Chama o método para obter todas as postagens do banco de dados.
    dao.obterPostagens((err, postagens) => {
        if (err) {
            console.error('Erro ao buscar postagens do banco de dados:', err);
            return res.status(500).json({ error: 'Erro ao buscar postagens' });
        }
        res.json(postagens); // Retorna as postagens como JSON.
    });
    
});

// Rota para excluir uma postagem pelo ID
app.delete('/api/postagens/:cd_postagem', async (req, res) => {
    const { cd_postagem } = req.params;
    try {
        const query = 'DELETE FROM postagem WHERE cd_postagem = ?';
        await new Promise((resolve, reject) => {
            connection.query(query, [cd_postagem], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        res.status(200).json({ success: true, message: 'Postagem excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao excluir a postagem' });
    }
});

app.get('/api/postagens/pendentes', (req, res) => {
    const query = 'SELECT * FROM postagem WHERE aprovada = 0'; // Assumindo que o campo 'aprovada' é 0 para pendentes
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar postagens pendentes:', err);
            return res.status(500).json({ error: 'Erro ao buscar postagens pendentes' });
        }
        res.json(results);
    });
});

// Rota para aprovar uma postagem
app.post('/api/aprovarPostagem/:cd_postagem', (req, res) => {
    const cd_postagem = req.params.cd_postagem;
    const query = 'UPDATE postagem SET aprovada = 1 WHERE cd_postagem = ?'; // Atualiza a postagem para aprovada
    connection.query(query, [cd_postagem], (err) => {
        if (err) {
            console.error('Erro ao aprovar a postagem:', err);
            return res.status(500).json({ success: false, message: 'Erro ao aprovar postagem' });
        }
        res.json({ success: true });
    });
});

app.post('/api/reprovarPostagem/:cd_postagem', (req, res) => {
    const cd_postagem = req.params.cd_postagem;
    const { motivo_recusa } = req.body;

    if (!motivo_recusa || motivo_recusa.trim() === '') {
        return res.status(400).json({ success: false, message: 'Motivo da recusa é obrigatório.' });
    }

    const dao = require('./public/js/dao.js');
    dao.reprovarPostagem(cd_postagem, motivo_recusa, (err, results) => {
        if (err) {
            console.error('Erro ao reprovar postagem:', err);
            return res.status(500).json({ success: false, message: 'Erro ao reprovar postagem.' });
        }
        res.json({ success: true, message: 'Postagem reprovada com sucesso.' });
    });
});


// Rota para obter uma postagem específica pelo ID.
app.get('/api/postagem/:cd_postagem', (req, res) => {
    const cd_postagem = req.params.cd_postagem; // Obtém o ID da postagem da URL.
    const dao = require('./public/js/dao.js');

    // Chama o método para obter uma postagem específica.
    dao.obterPostagemPorId(cd_postagem, (err, postagem) => {
        if (err) {
            console.error('Erro ao buscar a postagem:', err);
            return res.status(500).json({ error: 'Erro ao buscar a postagem' });
        }
        res.json(postagem); // Retorna a postagem encontrada como JSON.
    });
});

// Rota para autenticação de login.
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const dao = require('./public/js/dao.js');

    dao.obterUsuarioPorEmailSenha(email, senha, (err, usuario) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao acessar o banco de dados.' });
        }

        if (usuario) {
            // Se o login for bem-sucedido, armazena o nome e a foto do perfil do usuário na sessão.
            req.session.usuario = { nome: usuario.nome, foto_perfil: usuario.foto_perfil, email: usuario.email };
            console.log('Login bem-sucedido:', usuario);

            // Verifica se o email é do analista
            const isAnalista = email === 'AnalistaCRA@gmail.com';

            req.session.save(() => { // Garante que a sessão foi salva antes de retornar.
                return res.json({ success: true, isAnalista });
            });
        } else {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
        }
    });
});


// Rota para desconectar (logout) o usuário.
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Erro ao fazer logout.');
        }
        res.json({ success: true }); // Retorna um sucesso ao fazer logout.
    });
});

// Rota para obter os dados do usuário logado.
app.get('/api/usuarioLogado', (req, res) => {
    if (req.session.usuario) {
        const isAnalista = req.session.usuario.email === 'AnalistaCRA@gmail.com';
        res.json({ logado: true, nome: req.session.usuario.nome, foto_perfil: req.session.usuario.foto_perfil, isAnalista });
    } else {
        res.json({ logado: false });
    }
});

// Inicializa o servidor na porta 3000 ou na porta definida no ambiente.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
