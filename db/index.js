const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/bookmark');
const { STRING } = Sequelize;

const Bookmark = db.define('bookmark', {
    url: {
        type: STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true,
            isUrl: true
        }
    }
});

const Category = db.define('category', {
    name: {
        type: STRING,
        unique: true,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    }
});

Bookmark.belongsTo(Category);
// Category.hasMany(Bookmark);

module.exports = {
    db,
    models: {
        Bookmark,
        Category
    }
}

