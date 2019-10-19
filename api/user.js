const bcrypt = require('bcrypt-nodejs');

module.exports = app => {
    const obterHash = (password, callback) => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, null, (err, hash) => callback(hash));
        })
    }

    const save = async (req, res) => {

        let email = req.body.email.trim().toLowerCase();

        const users = await app.db('users')
            .where({ email: email })
            .first()

        if (users){
            return res.status(401).json('Usuário já cadastrado');
        }

        obterHash(req.body.password, hash => {
            const password = hash
            
            app.db('users')
                .insert({ 
                    name: req.body.name,
                    city: req.body.city,
                    state: req.body.state,
                    whatsapp: req.body.whatsapp,
                    email: email,
                    password: password,
                })
                .then(_ => res.status(204).send())
                .catch(err => res.status(400).json(err))
        })
    }

    const deleteUser = (req, res) => {
        app.db('users')
            .where({ id: req.user.id })
            .del()
            .then(rowsDeleted => {
                if (rowsDeleted > 0) {
                    res.status(204).send();
                } else {
                    const msg = `Não foi encontrado esse usuário`
                    res.status(400).send(msg);
                }
            })
            .catch(err => res.status(400).json(err));
    }

    const updateUser = async (req, res) => {

        // valida se campos nao estão vazios ---
        if(
            !req.body.name ||
            !req.body.city ||
            !req.body.state ||
            !req.body.whatsapp
        ){
            return res.status(400).json('Preencha os campos corretamente');
        }

        // valida se foi digitado nova senha porem sem confirmar a senha atual
        if (req.body.newPassword && !req.body.password){
            return res.status(400).json('Informe sua senha para troca-la');
        }

        // se tiver senha valida senha atual e faz update de todos dados
        if (req.body.newPassword) {
            
            const user = await app.db('users')
                .where({ id: req.user.id })
                .first()

            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                // se deu bom

                if (err || !isMatch) {
                    return res.status(401).send("Senha inválida");
                }

                obterHash(req.body.newPassword, hash => {
                    const password = hash

                    app.db('users')
                        .where({ id: req.user.id })
                        .update({
                            name: req.body.name,
                            city: req.body.city,
                            state: req.body.state,
                            whatsapp: req.body.whatsapp,
                            password: password,
                        })
                        .then(_ => res.status(204).send())
                        .catch(err => res.status(400).json(err))
                })

            }) 

        }else{

            app.db('users')
                .where({ id: req.user.id })
                .update({
                    name: req.body.name,
                    city: req.body.city,
                    state: req.body.state,
                    whatsapp: req.body.whatsapp,
                })
                .then(_ => res.status(204).send())
                .catch(err => res.status(400).json(err));
        }
    }

    const getLoggedUser = (req, res) => {

        app.db('users')
            .where({id: req.user.id})
            .first()
            .then(user => res.json(user))
            .catch(err => res.status(400).json(err))
    }

    return { save, updateUser, getLoggedUser, deleteUser }
}