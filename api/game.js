module.exports = app => {

    const getUserGames = (req, res) => {
        
        app.db('games')
            .where({ user_id: req.user.id })
            .orderBy('name')
            .then(games => res.json(games))
            .catch(err => res.status(400).json(err))
    }

    const getMainCardsGames = (req, res) => {
        
        app.db('games')
            .whereNotIn('id', function () {
                this.select('game_id').from('rejected');
            })
            .andWhere('user_id', '<>', req.user.id)
            .andWhere('status', '=', 0)
            .limit(10)
            .then(games => res.json(games))
            .catch(err => res.status(400).json(err))
    }

    const saveGame = (req, res) => {

        app.db('games')
            .insert(
                {
                    name: req.body.gameName,
                    photo: req.body.gameUri,
                    platform: req.body.platformUri,
                    rating_box: req.body.ratingBox,
                    rating_media: req.body.ratingMedia,
                    rating_manual: req.body.ratingManual,
                    user_id: req.user.id,
                }
            )
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))
    }


    const deleteGame = (req, res) => {
        app.db('games')
            .where({ id: req.params.id, user_id: req.user.id })
            .del()
            .then(rowsDeleted => {
                if (rowsDeleted > 0) {
                    res.status(204).send();
                } else {
                    const msg = `Não foi encontrado esse jogo`
                    res.status(400).send(msg);
                }
            })
            .catch(err => res.status(400).json(err));
    }

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
                    user_id_a: idUserLogged,    // usuario logado
                    game_id_a: idGameWanted,    // jogo que usuario logado quer
                    user_id_b: idUserGameOwner, // usuario dono do jogo que voce quer
                    game_id_b: idGameUserLogged,// jogo do usuario logado
                }
            )
            .then(_ => res.status(204).send())
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

    return { getMainCardsGames, getUserGames, saveGame, wantedGame, rejectedGame, deleteGame, updateStatusExchange }
}