const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const NodeCache = require('node-cache');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());

const cache = new NodeCache({ stdTTL: 3600 });

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

const mongoUrl = 'mongodb+srv://guyuusuke:twq22222@busca.evq7kzw.mongodb.net/';
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
})
    .then(() => console.log('MongoDB conectado'))
    .catch(err => logger.error('Erro ao conectar ao MongoDB', err));

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const GameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    platforms: { type: [String], required: true },
    background_image: { type: String, required: true }
});
const Game = mongoose.model('Game', GameSchema);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Muitas tentativas de login, por favor tente novamente mais tarde'
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        logger.error('Erro ao registrar usuário', err);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

app.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    try {
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const token = jwt.sign({ userId: user._id }, 'secreto', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        logger.error('Erro ao fazer login', err);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Acesso negado' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.userId = decoded.userId;
        next();
    });
};

app.get('/busca',
    authMiddleware,
    check('nomeJogo').trim().escape().notEmpty().withMessage('O nome do jogo é obrigatório'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nomeJogo } = req.query;
        const cachedResult = cache.get(nomeJogo);
        if (cachedResult) {
            return res.json(cachedResult); 
        }

        try {
            const jogosInseridos = await Game.find({ name: new RegExp(nomeJogo, 'i') }); 

            let resultados = jogosInseridos;

            const apiKey = 'd209e82699274d69bc9dc1012f9b73b7';
            const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(nomeJogo)}&key=${apiKey}`;

            console.log(`Buscando jogos na URL: ${url}`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro na API externa: ${response.statusText} (Status: ${response.status})`);
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                resultados = resultados.concat(data.results); 
            }

            cache.set(nomeJogo, resultados);

            res.json(resultados);
        } catch (error) {
            logger.error('Erro ao buscar jogos', error);
            res.status(500).json({ error: 'Erro ao buscar jogos', details: error.message });
        }
    }
);

app.post('/inserir-jogo', authMiddleware, async (req, res) => {
    const { name, platforms, background_image } = req.body;

    if (!name || !platforms || !background_image) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const novoJogo = new Game({
            name,
            platforms,
            background_image
        });

        await novoJogo.save();
        res.status(201).json({ message: 'Jogo inserido com sucesso!', jogo: novoJogo });
    } catch (error) {
        logger.error('Erro ao inserir jogo', error);
        res.status(500).json({ error: 'Erro ao inserir jogo' });
    }
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});