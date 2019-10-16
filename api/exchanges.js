module.exports = app => {

    const wantedGame = async (req, res) => {

        let idGameWanted = req.body.gameId; //id do jogo que o usuario logado quer
        let idUserLogged = req.user.id;     // id do usuario logado
        
        let idUserGameOwner = req.body.idUserGameOwner; // id do proprietario do jogo

        // verifica se deu match
        let idGameUserLogged = await app.db.select('game_id').from('wanted').join('games', function () {
            this.on('wanted.user_id', '=', idUserGameOwner)
                .andOn('games.user_id', '=', idUserLogged)
                .andOn('wanted.game_id', '=', 'games.id')
        })
            .first()
            .catch(err => res.status(400).json(err));

        if (idGameUserLogged) {

            // e exclui da tabela de desejo o jogo que de match
            app.db('wanted')
                .where({ game_id: idGameUserLogged.game_id })
                .del()
                .then(rowsDeleted => {
                    if (rowsDeleted > 0) {

                        // atualiza status do jogo para 1 = em troca para o usuario logado
                        app.db('games')
                            .where({ id: idGameWanted })
                            .update({ status: 1 })
                            .catch(err => res.status(400).json(err))
                        
                        // atualiza status do jogo para 1 = em troca para o outro usuario
                        app.db('games')
                            .where({ id: idGameUserLogged.game_id })
                            .update({ status: 1 })
                            .catch(err => res.status(400).json(err))
                        
                        exchangesGames(req, res, idUserLogged, idGameWanted, idUserGameOwner, idGameUserLogged.game_id)
                        
                        // res.status(204).send();
                    } else {
                        const msg = `Não foi encontrado esse jogo`
                        res.status(400).send(msg);
                    }
                })
                .catch(err => res.status(400).json(err));

        }else{
            // se nao cadastra um novo jogo de desejo
            app.db('wanted')
                .insert(
                    {
                        user_id: idUserLogged,
                        game_id: idGameWanted
                    }
                )
                .then(_ => res.status(204).send())
                .catch(err => res.status(400).json(err));
        }  
            
    }

    const exchangesGames = (req, res, idUserLogged, idGameWanted, idUserGameOwner, idGameUserLogged) => {

        app.db('exchanges')
            .insert(
                {
                    user_id_a: idUserLogged,     // usuario logado
                    game_id_a: idGameUserLogged, // jogo que usuario logado quer
                    user_id_b: idUserGameOwner,  // usuario dono do jogo que voce quer
                    game_id_b: idGameWanted,     // jogo do usuario logado
                }
            )
            .returning('id')
            .then(async function (id) {

                const rowInserted = await app.db.select('*').from('exchanges').whereIn('id', id);
                
                const listExchanges = [];

                for (const [idx, el] of rowInserted.entries()) {

                    let ownerGameId = '', wantedGameId = '';

                    // define qual jogo é do usuario logado e qual o usuario quer
                    if (el.user_id_a === req.user.id) {
                        ownerGameId = el.game_id_a;
                        wantedGameId = el.game_id_b;
                    } else {
                        ownerGameId = el.game_id_b;
                        wantedGameId = el.game_id_a;
                    }

                    // resgata jogo do usuario
                    let ownerGame = await app.db('games')
                        .where({ id: ownerGameId })
                        .first()
                        .catch(err => res.status(400).json(err));

                    // resgata jogo que ele quer
                    let wantedGame = await app.db('games')
                        .where({ id: wantedGameId })
                        .first()
                        .catch(err => res.status(400).json(err));

                    await listExchanges.push({
                        ownerGamePhoto: ownerGame.photo,
                        wantedGamePhoto: wantedGame.photo,
                    });

                };

                res.json(listExchanges);
            })
            .catch(err => res.status(400).json(err))
    }

    const rejectedGame = (req, res) => {

        app.db('rejected')
            .insert(
                {
                    user_id: req.user.id,
                    game_id: req.body.gameId
                }
            )
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))
    }

    const updateStatusExchange = (req, res) => {
        app.db('exchanges')
            .where({ id: req.body.id_exchange })
            .update({ status: req.body.status })
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err));

        // atualiza status do jogo para 2 se o status da troca for positiva ou 0 se for negativa, assim voltando o jogo para lista de jogos
        app.db('games')
            .where({ id: req.body.id_game_a })
            .update({ status: req.body.status === 1 ? 2 : 0 })
            .catch(err => res.status(400).json(err))

        // atualiza status do jogo para 2 se o status da troca for positiva ou 0 se for negativa, assim voltando o jogo para lista de jogos
        app.db('games')
            .where({ id: req.body.id_game_b })
            .update({ status: req.body.status === 1 ? 2 : 0 })
            .catch(err => res.status(400).json(err))
    }

    const getExchanges = async (req, res) => {

        const listExchanges = [];

        let exchangesUser = await app.db('exchanges')
            .where({ user_id_a: req.user.id })
            .orWhere({ user_id_b: req.user.id })
            .catch(err => res.status(400).json(err));

        // popula lista de trocas --------
        async function makeListExchanges(exchangesUser) {

            for (const [idx, el] of exchangesUser.entries()) {

                let ownerUserId = '', wantedUserId = '', ownerGameId = '', wantedGameId = '';

                // define qual jogo é do usuario logado e qual o usuario quer
                if (el.user_id_a === req.user.id) {
                    ownerUserId = el.user_id_a;
                    wantedUserId = el.user_id_b;
                    ownerGameId = el.game_id_a;
                    wantedGameId = el.game_id_b;
                } else {
                    ownerUserId = el.user_id_b;
                    wantedUserId = el.user_id_a;
                    ownerGameId = el.game_id_b;
                    wantedGameId = el.game_id_a;
                }

                // resgata jogo do usuario
                let ownerGame = await app.db('games')
                    .where({ id: ownerGameId })
                    .first()
                    .catch(err => res.status(400).json(err));

                // resgata jogo que ele quer
                let wantedGame = await app.db('games')
                    .where({ id: wantedGameId })
                    .first()
                    .catch(err => res.status(400).json(err));

                // resgata dados do usuario dono do jogo
                let wantedUser = await app.db('users')
                    .where({ id: wantedUserId })
                    .first()
                    .catch(err => res.status(400).json(err));

                await listExchanges.push({
                    id_exchange: el.id,
                    status_exchange: el.status,
                    ownerUserId: ownerUserId,
                    ownerGameId: ownerGameId,
                    ownerGamePhoto: ownerGame.photo,
                    ownerGameName: ownerGame.name,
                    wantedUserId: wantedUserId,
                    wantedUserName: wantedUser.name,
                    wantedUserPhoto: wantedUser.photo,
                    wantedUserCity: wantedUser.city,
                    wantedUserState: wantedUser.state,
                    wantedUserWhatsapp: wantedUser.whatsapp,
                    wantedGameId: wantedGameId,
                    wantedGamePhoto: wantedGame.photo,
                    wantedGameName: wantedGame.name,
                });

            };
        }

        try{

            if (exchangesUser.length > 0){
                await makeListExchanges(exchangesUser);
            }

            res.status(200).json(listExchanges);
                
        }catch{
            res.status(400).send();
        }
    }

    return { wantedGame, rejectedGame, updateStatusExchange, getExchanges }
}