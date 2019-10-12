const { authSecret } = require('../.env');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

module.exports = app => {
    const signin = async (req, res) => {

        let email = req.body.email.trim().toLowerCase();

        if(!email || !req.body.password) {
            return res.status(400).send("Dados inválidos");
        }

        const user = await app.db('users')
            .where({ email: email})
            .first()

        if(user) {
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                // se deu bom

                if(err || !isMatch){
                    return res.status(401).send();
                }

                const payload = { id: user.id }
                res.json({
                    name: user.name,
                    photo: user.photo,
                    city: user.city,
                    state: user.state,
                    whatsapp: user.whatsapp,
                    email: user.email,
                    token: jwt.encode(payload, authSecret),
                })
            }) 
        } else {
            res.status(400).send("E-mail ou senha inválidos");
        }
    }

    return { signin }
}