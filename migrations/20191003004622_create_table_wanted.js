
exports.up = function (knex) {
    return knex.schema.createTable('wanted', table => {
        table.increments('id').primary();
        table.integer('user_id')
            .references('id')
            .inTable('users')
            .notNull()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.integer('game_id')
            .references('id')
            .inTable('games')
            .notNull()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('wanted');
};
