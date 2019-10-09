exports.up = function (knex) {
    return knex.schema.createTable('exchanges', table => {
        table.increments('id').primary();
        table.integer('user_id_a')
            .references('id')
            .inTable('users')
            .notNull()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.integer('game_id_a')
            .references('id')
            .inTable('games')
            .notNull()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.integer('user_id_b')
            .references('id')
            .inTable('users')
            .notNull()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.integer('game_id_b')
            .references('id')
            .inTable('games')
            .notNull()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.integer('status').notNull().defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('exchanges');
};
