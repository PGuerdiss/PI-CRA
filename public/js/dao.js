const mysql = require('mysql2');

// Cria a conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost',   // O endereço do servidor de banco de dados (localhost significa que o servidor está rodando na mesma máquina)
    user: 'root',        // O nome de usuário usado para se conectar ao banco de dados
    password: 'root',    // A senha do usuário do banco de dados
    database: 'cra'      // O nome do banco de dados que será utilizado
});

// Inicia a conexão com o banco de dados
connection.connect((err) => {
    if (err) {
        // Caso ocorra um erro ao tentar se conectar, ele será exibido no console
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
    }
    // Se a conexão for bem-sucedida, exibe uma mensagem no console
    console.log('Conectado ao banco de dados.');
});

// Método para gravar um usuário no banco de dados
// Parâmetros: nome, cpf, telefone, email, senha, foto_perfil e uma função de callback para tratar o resultado
function gravarUsuario(nome, cpf, telefone, email, senha, foto_perfil, callback) {
    const query = 'INSERT INTO usuario (nome, cpf, telefone, email, senha, foto_perfil) VALUES (?, ?, ?, ?, ?, ?)';
    // Executa a query de inserção no banco de dados
    connection.execute(query, [nome, cpf, telefone, email, senha, foto_perfil], (err, results) => {
        if (err) return callback(err); // Se ocorrer um erro, o callback é chamado com o erro
        callback(null, results);        // Caso contrário, o callback é chamado com os resultados da operação
    });
}

// Método para obter todos os usuários do banco de dados
function obterUsuarios(callback) {
    const query = 'SELECT cd_usuario, nome, telefone, email, senha, foto_perfil FROM usuario'; // Obtém os campos especificados
    connection.query(query, (err, results) => {
        if (err) return callback(err); // Em caso de erro, o callback é chamado com o erro
        callback(null, results);       // Se bem-sucedido, retorna os resultados
    });
}

// Método para gravar uma nova postagem no banco de dados
// Parâmetros: nome, idade, ultima_localidade, data, informacoes_adicionais, foto e uma função de callback
function gravarPostagem(nome, idade, ultima_localidade, data, informacoes_adicionais, foto, callback) {
    const query = 'INSERT INTO postagem (nome, idade, ultima_localidade, data, informacoes_adicionais, foto, aprovada) VALUES (?, ?, ?, ?, ?, ?, 0)';
    // Executa a query de inserção
    connection.execute(query, [nome, idade, ultima_localidade, data, informacoes_adicionais, foto], (err, results) => {
        if (err) return callback(err);  // Em caso de erro, o callback é chamado com o erro
        callback(null, results);        // Se bem-sucedido, retorna os resultados da inserção
    });
}

// Método para obter todas as postagens do banco de dados
function obterPostagens(callback) {
    const query = 'SELECT * FROM postagem WHERE aprovada = 1'; // Seleciona apenas postagens aprovadas
    connection.query(query, (err, results) => {
        if (err) return callback(err); // Em caso de erro, o callback é chamado com o erro
        callback(null, results);       // Retorna os resultados se a operação for bem-sucedida
    });
}

// Método para obter postagens pendentes de aprovação
function obterPostagensPendentes(callback) {
    const query = 'SELECT * FROM postagem WHERE aprovada = 0'; // Seleciona postagens ainda não aprovadas
    connection.query(query, (err, results) => {
        if (err) return callback(err); // Em caso de erro, o callback é chamado com o erro
        callback(null, results);       // Retorna os resultados
    });
}

function aprovarPostagem(cd_postagem, callback) {
    const query = 'UPDATE postagem SET aprovada = 1 WHERE cd_postagem = ?';
    connection.execute(query, [cd_postagem], (err, results) => {
        if (err) return callback(err);  // Em caso de erro, o callback é chamado com o erro
        callback(null, results);        // Se bem-sucedido, retorna os resultados da operação
    });
}
function reprovarPostagem(cd_postagem, motivo_recusa, callback) {
    const query = 'UPDATE postagem SET aprovada = 0, motivo_recusa = ? WHERE cd_postagem = ?';
    connection.execute(query, [motivo_recusa, cd_postagem], (err, results) => {
        if (err) return callback(err);  // Em caso de erro, o callback é chamado com o erro
        callback(null, results);        // Retorna os resultados da operação
    });
}


// Método para obter um usuário baseado no email e senha
// Útil para realizar o login do usuário
function obterUsuarioPorEmailSenha(email, senha, callback) {
    const query = 'SELECT * FROM usuario WHERE email = ? AND senha = ?';
    // Executa a query para buscar o usuário pelo email e senha
    connection.query(query, [email, senha], (err, results) => {
        if (err) {
            return callback(err);  // Em caso de erro, o callback é chamado com o erro
        }
        if (results.length > 0) {
            callback(null, results[0]);  // Se encontrar um usuário, retorna o primeiro resultado
        } else {
            callback(null, null);  // Se nenhum usuário for encontrado, retorna null
        }
    });
}

// Método para obter uma postagem específica pelo ID
function obterPostagemPorId(cd_postagem, callback) {
    const query = 'SELECT * FROM postagem WHERE cd_postagem = ?';
    // Executa a query para buscar a postagem pelo ID
    connection.query(query, [cd_postagem], (err, results) => {
        if (err) return callback(err);  // Em caso de erro, o callback é chamado com o erro
        callback(null, results[0]);     // Retorna a postagem encontrada (o primeiro resultado)
    });
}

// Exporta todas as funções para que possam ser usadas em outros arquivos
module.exports = {
    gravarUsuario,
    obterUsuarios,
    gravarPostagem,
    obterPostagens,
    obterUsuarioPorEmailSenha,
    obterPostagemPorId,
    obterPostagensPendentes,  // Novo método para buscar postagens pendentes
    aprovarPostagem,
    reprovarPostagem          
};