import fs from "fs";
import { getTodosPosts, criarPost, atualizarPost }from "../models/postsModel.js";
import { gerarDescricaoComGemini } from "../services/geminiService.js";


export async function listarPosts(req, res) {
    // Chama a função getTodosPosts para obter os posts
    const posts = await getTodosPosts();
    // Envia os posts como resposta em formato JSON com status 200 (sucesso)
    res.status(200).json(posts);
}

export async function postarNovoPost(req, res) {
    // Define uma função assíncrona chamada 'postarNovoPost' que recebe a requisição (req) e a resposta (res) como parâmetros.
    // Essa função é exportada para poder ser utilizada em outros módulos.
    const novoPost = req.body;
    // Extrai os dados do novo post a partir do corpo da requisição e armazena em uma variável.

    try {
        // Inicia um bloco try-catch para tratar possíveis erros durante a execução.
        const postCriado = await criarPost(novoPost);
        // Chama a função 'criarPost' (assumida como existente) passando os dados do novo post e aguarda a conclusão da operação.
        // O resultado da criação do post é armazenado em 'postCriado'.
        res.status(200).json(postCriado);
        // Envia uma resposta HTTP com status 200 (sucesso) e o objeto 'postCriado' no formato JSON.
    } catch(erro) {
        // Caso ocorra algum erro durante a criação do post, entra nesse bloco.
        console.error(erro.message);
        // Imprime a mensagem de erro no console para facilitar a depuração.
        res.status(500).json({"Erro":"Falha na requisição"})
        // Envia uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem de erro genérica.
    }
}

export async function uploadImagem(req, res) {
    // Define uma função assíncrona chamada 'uploadImagem' que também recebe a requisição e a resposta como parâmetros.
    const novoPost = {
        descricao: "",
        imgUrl: req.file.originalname, // Obtém o nome original do arquivo enviado
        alt: ""
    }
    // Cria um objeto 'novoPost' com os dados necessários para criar um novo post, incluindo o nome do arquivo da imagem.

    try {
        const postCriado = await criarPost(novoPost);
        // Chama a função 'criarPost' para criar o post com os dados iniciais.
        const imagemAtualizada = `uploads/${postCriado.insertedId}.png`;
        // Constrói o novo caminho completo para a imagem, utilizando o ID do post criado.
        fs.renameSync(req.file.path, imagemAtualizada);
        // Renomeia o arquivo da imagem para o novo caminho, utilizando o módulo 'fs'.
        res.status(200).json(postCriado);
        // Envia uma resposta HTTP com status 200 e os dados do post criado.
    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    }
}

export async function atualizarNovoPost(req, res) {
    const id = req.params.id;
    const urlImagem = `http://localhost:3000/${id}.png`

    try {
        const imgBuffer = fs.readFileSync(`uploads/${id}.png`)
        const descricao = await gerarDescricaoComGemini(imgBuffer)

        const post = {
            imgUrl: urlImagem,
            descricao: descricao,
            alt: req.body.alt
        }

        const postCriado = await atualizarPost(id, post);
        res.status(200).json(postCriado);  
    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"});
    }
}