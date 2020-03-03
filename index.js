const express = require('express')
const app = express()

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite',{Promise})
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/',async(request,response) => {
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas')
    const categorias = categoriasDb.map(cat => {
        return{
            ...cat,
            vagas: vagas.filter( vaga => vaga.fk_categoria == cat.id)
        }
    })
    
    response.render('home', {
        categorias
    })
})

app.get('/vaga/:id',async(request,response) => {
    const db = await dbConnection
    const vaga = await db.get(`select * from vagas where vagas.id = '${request.params.id}' `)
    
    response.render('vaga', {
        vaga
    })
})

app.get('/admin', (req,res) => {
    res.render('admin/home')
})

app.get('/admin/vagas',async(req,res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas')
    res.render('admin/vagas',{vagas})
})

app.get('/admin/categorias',async(req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/categorias',{categorias})
})

app.get('/admin/vagas/delete/:id',async(req,res)=>{
    const db = await dbConnection
    await db.run(`delete from vagas where vagas.id = '${req.params.id}'`)
    res.redirect('/admin/vagas')
})

app.get('/admin/categorias/delete/:id',async(req,res)=>{
    const db = await dbConnection
    await db.run(`delete from categorias where id = '${req.params.id}'`)
    res.redirect('/admin/categorias')
})

app.get('/admin/categorias/editar/:id',async(req,res)=>{
    const db = await dbConnection
    const categoria = db.get(`select * from categorias where id = '${req.params.id}' `)
    res.render('admin/editar-categoria',{categoria}) 
})

app.get('/admin/vagas/nova',async(req,res)=>{
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga',{categorias})
})

app.get('/admin/categorias/nova',(req,res)=>{
    //const db = await dbConnection
    //const categorias = await db.all('select * from categorias')
    res.render('admin/nova-categoria')
})
app.get('/admin/vagas/editar/:id',async(req,res)=>{
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const id = req.params.id
    const vaga = await db.get(`select * from vagas where id = '${id}'`)
    res.render('admin/editar-vaga',{categorias,vaga})
})

app.post('/admin/vagas/nova', async(req,res)=>{
    const {titulo, descricao, categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(fk_categoria, titulo, descricao) values ('${categoria}','${titulo}','${descricao}')`)
    res.redirect('/admin/vagas')
})

app.post('/admin/categorias/nova', async(req,res)=>{
    const {categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into categorias(categoria) values ('${categoria}')`) 
    res.redirect('/admin/categorias')
})

app.post('/admin/vagas/editar/:id', async(req,res)=>{
    const {titulo, descricao, categoria} = req.body
    const id = req.params.id
    const db = await dbConnection
    await db.run(`update vagas set fk_categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = '${id}'`)
    res.redirect('/admin/vagas')
})

app.post('/admin/categorias/editar/:id', async(req,res)=>{
    const {categoria} = req.body
    const db = await dbConnection
    //const categExist = db.run(`EXISTS(select * from categorias where categoria = '${categoria}')`)
    //console.log(categExist)
    await db.run(`update categorias set categoria = '${categoria}' where id = '${req.params.id}'`)
    res.redirect('/admin/categorias')
})

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, fk_categoria INTEGER, titulo TEXT, descricao TEXT, FOREIGN KEY(fk_categoria) REFERENCES categorias(id));')
    //await db.run('CREATE UNIQUE INDEX unique_categoria ON categorias(categoria);')
    //const vaga = 'Social Media (San Francisco)'
    //const descricao = 'Vaga para social media que fez o fullstacklab'
    //await db.run(`insert into vagas(fk_categoria, titulo, descricao) values (2,'${vaga}','${descricao}')`)

    //const categoria = 'Marketing Team'
    //await db.run(`insert into categorias (categoria) values ('${categoria}')`)
}
init()
//quando a app estiver em uso, mudar para 80 http ou 443 https
app.listen(port, (err) => {
    if(err){
        console.log('Não foi possível iniciar a servidor do jobify')
    }else{
        console.log('Servidor do jobify rodando')
    }
})
