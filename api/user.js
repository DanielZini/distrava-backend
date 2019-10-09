const bcrypt = require('bcrypt-nodejs');

module.exports = app => {
    const obterHash = (password, callback) => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, null, (err, hash) => callback(hash));
        })
    }

    const save = (req, res) => {
        obterHash(req.body.password, hash => {
            const password = hash
            
            app.db('users')
                .insert({ 
                    name: req.body.name,
                    city: req.body.city,
                    state: req.body.state,
                    whatsapp: req.body.whatsapp,
                    email: req.body.email,
                    password: password,
                })
                .then(_ => res.status(204).send())
                .catch(err => res.status(400).json(err))
        })
    }

    return { save }
}