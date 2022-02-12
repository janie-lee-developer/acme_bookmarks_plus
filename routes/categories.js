
const app = require('express').Router();
module.exports = app;

app.delete('/:id', async (req, res, next) => {
    try {
        const bookmark = await Bookmark.findByPk(req.params.id);
        await bookmark.destroy();
        res.redirect(`/categories/${bookmark.categoryId}`);
    }
    catch (ex) {
        next(ex);
    }
})

app.get('/:id', async (req, res, next) => {
    try {
        const bookmarks = await Bookmark.findAll({
            include: [Category],
            where: { categoryId: req.params.id }
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

    } catch (ex) {
        next(ex);
    }
})
