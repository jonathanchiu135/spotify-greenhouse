// store the functions that are used in requests 

const home_page = (req, res) => {
    res.render('home');
}

const menu_page = (req, res) => {
    res.render('menu');
}

const greenhouse_onemonth_page = (req, res) => {
    res.render('greenhouse-onemonth');
}

const greenhouse_sixmonths_page = (req, res) => {
    res.render('greenhouse-sixmonths');
}
const greenhouse_alltime_page = (req, res) => {
    res.render('greenhouse-alltime');
}

const error_page = (req, res) => {
    res.render('error');
}

module.exports = {
    home_page, 
    menu_page, 
    greenhouse_onemonth_page, 
    greenhouse_sixmonths_page, 
    greenhouse_alltime_page, 
    error_page
}