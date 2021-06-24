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

function getArticleComments(id){
    return db.data.articles[id].comments;
}

//getArticleComments(1)
//getArticles();




app.get('/users', (req, res) => {
    res.status(200).send('users');
})

app.get('/articles:id', (req, res) => {
    let article = getArticle(req.body.id);
    if(!article){
        res.status(404).send({error: `Can\`t get article with id: ${req.body.id}`})
    }
    res.status(200).send(article);
})

app.get('/articles', (req, res) => {
    res.status(200).send(getArticles());
})

app.put('/post-comment', (req, res) => {
    let result = postComment(req.body.id, req.body.comment);
})


app.listen(PORT);
console.log(`Listening on port: ${PORT}`);
