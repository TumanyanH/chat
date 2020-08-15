module.exports = {
    get500 : (res) => {
        return res.render('errors/500', {
            title : '500 Internal server error',
            layout : 'errors/500'
        })
    },
    get404 : (res) => {
        return res.render('errors/404', {
            title : '404 Not Found',
            layout : 'errors/404'
        })
    }
}