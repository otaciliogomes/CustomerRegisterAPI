const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).json({error: 'Token not provided'})

    const parts = authHeader.split(' ');

    if(!parts.length === 2)
        return res.status(401).json({error: 'Token error'})

    const [ schema, token ] = parts;

    if(!/^Bearer$/i.test(schema))
        return res.status(401).json({ error: 'Token molformmated' })

    jwt.verify(token, authConfig.secret, (error, decoded) => {
        if(error) {
            return res.status(401).json({ error: 'Token invalid'});
        }

        req.userId = decoded.id;
        return next(); 
    })
}