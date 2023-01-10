const express = require('express')
const app = express()
const port = process.env.PORT
const { Configuration, OpenAIApi } = require('openai')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs')

let OPEN_AI_API_KEY = process.env.API_KEY

let orgID = 'org-YqkSoqf18JKiZxGkdJpc0NSW'
let userPrompt = 'How are you'
let nodeResponse = 'AI response will be here'
let prevIP = '0'
const configuration = new Configuration({
    apiKey: OPEN_AI_API_KEY,
})


app.get('/', (req, res) =>{
    // res.sendFile(__dirname + '/public/index.html')
    // res.send('Hello')
    let ipAddress = req.socket.remoteAddress
    console.log(`${ipAddress} connected.`)

    if(ipAddress != prevIP){
        console.log(`Detecting new user ${ipAddress}... clearing values.`)
        nodeResponse = 'AI response will be here'
    } else {
        console.log(`Same user ${ipAddress} connected`)
    }

    prevIP = ipAddress
    res.render('index',{
        response: nodeResponse,
    })
    
})
app.post('/', (req, res) =>{
    userPrompt = req.body.userInput
    aiModel = req.body.chatModel
    let maxTokens = 200
    
    const openai = new OpenAIApi(configuration)
    const response = openai.createCompletion({
        model: 'text-davinci-003',
        prompt: userPrompt,
        max_tokens: maxTokens,
        temperature: 0,
    }).then((response) => {
        // res.setHeader('Content-type', 'text/html')
        // res.write(`<p> User input: ${userPrompt} </p> <hr>`)
        // res.write('<h1>' + response.data.choices[0].text + '</h1>')
        nodeResponse = response.data.choices[0].text
        // console.log(`Response: ${JSON.stringify(response.data)}`)
        // res.write('<a href="/index.html"> Try again </a>')
        // res.end()
        console.log('AI Response: ' + nodeResponse)
        res.redirect('/')

    })
    console.log('Query: ' + req.body.userInput)
})

app.post('/img', (req, res) =>{

    let imgPrompt = req.body.imgInput
    const openai = new OpenAIApi(configuration)
    const response = openai.createImage({
        prompt: imgPrompt,
        size: '512x512',
        n: 1,
    }).then((response) =>{
        let imgURL = response.data.data[0].url
        res.setHeader('Content-type', 'text/html')
        res.write(`<p> User image description: ${imgPrompt} </p> <hr>`)
        res.write(`<img src="${imgURL}"><br>`)
        res.write('<a href="/index.html"> Try again </a>')
        res.end()
    })

    // res.send('Image post submitted.')
})
app.listen(port || 3000, () => console.log(`App listening on port ${port}`))