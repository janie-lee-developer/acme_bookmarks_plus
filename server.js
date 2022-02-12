//db
const {db, models: {Bookmark, Category}} = require('./db');
//express
const express = require('express');
const app = express();
app.use(express.urlencoded({extended:false}));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.get('/', (req, res) => res.redirect('/bookmarks'));

app.use('/bookmarks', require('./routes/bookmarks'));
app.use('/categories', require('./routes/categories'));

const init = async() => {
    try{
        await db.authenticate();
        if (process.env.SYNC) {
            await db.sync({ force: true });

            const coding = await Category.create({ name: 'coding' });
            const shopping = await Category.create({ name: 'shopping' });
            const job = await Category.create({ name: 'job' });

            await Bookmark.create({ url: 'http://jobs.com', categoryId: job.id });
            await Bookmark.create({ url: 'http://stackoverflow.com', categoryId: coding.id });
            await Bookmark.create({ url: 'http://linkedin.com', categoryId: job.id });
            await Bookmark.create({ url: 'http://hm.com', categoryId: shopping.id });
        }
        const port = process.env.PORT || 1337;
        app.listen(port, ()=> console.log(`listening on port ${port}`));
    }
    catch(ex) {
        console.log(ex);
    }
}
init();
