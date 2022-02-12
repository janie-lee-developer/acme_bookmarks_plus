const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/bookmark');
const {STRING} = Sequelize;

//db
const Bookmark = db.define('bookmark', {
    url: {
        type: STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true,
            isUrl : true
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


//express
const express = require('express');
const app = express();
app.use(express.urlencoded({extended:false}));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.get('/', (req, res) => res.redirect('/bookmarks'));

app.post('/bookmarks', async(req, res, next)=> {
    try {
        const bookmark = await Bookmark.create(req.body);
        res.redirect(`/categories/${bookmark.categoryId}`)
    }
    catch(ex) {
        next(ex);
    }
});

app.get('/bookmarks', async(req, res, next) => {
    try{
        const bookmarks = await Bookmark.findAll({
            include: [Category]
        });

        const html = bookmarks.map(bookmark => {
            return `
                <li>${bookmark.url} | <a href='/categories/${bookmark.categoryId}'>${bookmark.category.name}</a></li>
            `
        }).join('');

        const categories = await Category.findAll();

        const options = categories.map(category => {
            return `
                <option value='${category.id}'>${category.name}</option>
            `
        })

        res.send(`
            <html>
                <head>
                    <title>ACME Bookmarks +</title>
                </head>
                <body>
                    <h1>ACME Bookmarks +</h1>
                    <form method='POST'>
                        <input name='url' placeholder='http://google.com'/>
                        <select name='categoryId'>
                            ${options}
                        </select>
                        <button>Create</button>
                    </form>
                    <ul>
                        ${html}
                    </ul>
                </body>
            </html>
        `);
    }
    catch(ex){
        next(ex)
    }
});

app.delete('/categories/:id', async (req, res, next) => {
    try {
        const bookmark = await Bookmark.findByPk(req.params.id);
        await bookmark.destroy();
        res.redirect(`/categories/${bookmark.categoryId}`);
    }
    catch(ex) {
        next(ex);
    }
})

app.get('/categories/:id', async (req, res, next) => {
    try{
        const bookmarks = await Bookmark.findAll({
            include: [Category],
            where: {categoryId:req.params.id}
        });

        const html = bookmarks.map(bookmark => {
            return `
                <li>
                    ${bookmark.url} | ${bookmark.category.name}
                    <form method='POST' action='/categories/${bookmark.id}?_method=delete'>
                        <button>X</button>
                    </form>
                </li>
            `
        }).join('');
        
        res.send(`
            <html>
                <head>
                    <title>ACME Bookmarks +</title>
                </head>
                <body>
                    <h1>ACME Bookmarks +</h1>
                    <h2>${bookmarks[0]['category']['name']}</h2>
                    <a href='/bookmarks'>Back</a>
                    <ul>
                        ${html}
                    </ul>
                </body>
            </html>
        `)

    } catch(ex) {
        next(ex);
    }
})


const init = async() => {
    try{
        await db.sync({ force: true });

        const coding = await Category.create({ name: 'coding' });
        const shopping = await Category.create({ name: 'shopping' });
        const job = await Category.create({ name: 'job' });

        await Bookmark.create({ url: 'http://jobs.com', categoryId: job.id});
        await Bookmark.create({ url: 'http://stackoverflow.com', categoryId: coding.id });
        await Bookmark.create({ url: 'http://linkedin.com', categoryId: job.id});
        await Bookmark.create({ url: 'http://hm.com', categoryId: shopping.id });

        const port = process.env.PORT || 1337;
        app.listen(port, ()=> console.log(`listening on port ${port}`));
    }
    catch(ex) {
        console.log(ex);
    }
}
init();