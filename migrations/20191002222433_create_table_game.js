
exports.up = function(knex) {
    return knex.schema.createTable('games', table => {
        table.increments('id').primary();
        table.string('name').notNull();
        table.string('photo').notNull();
        table.string('platform').notNull();
        table.integer('rating_box').notNull();
        table.integer('rating_media').notNull();
        table.integer('rating_manual').notNull();
        table.integer('status').notNull().defaultTo(0);
        table.integer('user_id')
            .references('id')
            .inTable('users')
            .notNull()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('games')
};