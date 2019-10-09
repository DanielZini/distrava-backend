// Update with your config settings.

module.exports = {


	client: 'postgresql',
	connection: {
		database: 'distrava',
		user:     'postgres',
		password: 'qwe123'
	},
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: 'knex_migrations'
	}

};
