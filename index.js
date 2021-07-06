import { join } from 'path';
import { Low, JSONFile } from 'lowdb';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
const PORT = 4201;

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json');

const adapter = new JSONFile(file);
const db = new Low(adapter);
await db.read();


function getArticles(){
    try{
        const {articles} = db.data;
        console.log('getArticles()');
        return articles;
    }
    catch(err){
        console.log(err)
    }
}

function getArticle(id){
    
    try{
        const article = db.data.articles.find(article => article.id == id);
        console.log(`getArticle(${id})`);
        return article;
    }
    catch(err){
        console.log(err);
    }
}

async function postArtcle(article){
    try{
        let nextArticleId = getNextArticleId();
        article.id = nextArticleId;
        article.comments = [];
        db.data.articles.push(article);
        await db.write();
        return article;
    }
    catch(err){
        console.log(`<!>ERROR: (postArticle) \n ${err}`)
        return {error: err}
    }
}


async function postComment(id, name, text){
    try{
        let article = db.data.articles.find(article => article.id == id);
        article.comments.push({name, text})
        await db.write()
        return article;
    }
    catch(err){
        console.log(`<!>ERROR:\n ${err}`)
        return {error: err}
    }
}

function getNextArticleId(){
    const article = db.data.articles.reduce((prev, current) => {
        return (parseInt(prev.id) > parseInt(current.id)) ? prev : current
    })
    
    return parseInt(article.id) + 1;
}


app.get('/users', (req, res) => {
    res.status(200).send('users');
})

app.get('/articles:id', (req, res) => {
    console.log('get article')
    let article = getArticle(req.body.id);
    if(!article){
        res.status(400).send({error: `Can\`t get article with id: ${req.body.id}`})
    }
    res.status(200).send(article);
})

app.get('/lastArticle', (req, res) => {
    const lastArticleId = getNextArticleId() - 1;
    let article = getArticle(lastArticleId);
    if(!article){
        res.status(400).send({error: `Can\`t get article with id: ${lastArticleId}`})
    }
    res.status(200).send(article);
})

app.get('/articles', (req, res) => {
    res.status(200).send(getArticles());
})

app.get('/next-article-id', (req, res) => {
    res.status(200).send({id: getNextArticleId()});
})

app.put('/post-comment', async (req, res) => {
    let result = await postComment(req.body.id, req.body.name, req.body.text);
    console.log(result);
    if(result.err){
        res.status(400).send(result.err);
    }
    res.status(200).send(result);
})

app.put('/post-article', async (req,res) => {
    let result = await postArtcle(req.body);
    console.log(result);
    if(result.error){
        res.status(400).send(result.err)
    }
    res.status(200).send(result);
})


app.listen(PORT);
console.log(`Listening on port: ${PORT}`);
