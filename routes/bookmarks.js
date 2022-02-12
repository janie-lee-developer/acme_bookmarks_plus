
const app = require('express').Router();
module.exports = app;

app.post('/', async (req, res, next) => {
    try {
        const bookmark = await Bookmark.create(req.body);
        res.redirect(`/categories/${bookmark.categoryId}`)
    }
    catch (ex) {
        next(ex);
    }
});

app.get('/', async (req, res, next) => {
    try {
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
    catch (ex) {
        next(ex)
    }
});
