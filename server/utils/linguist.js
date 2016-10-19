var languages = require('language-map');

var extensions = {};
var colors = {};


Object.keys(languages).forEach(function(language) {
    if (languages[language].extensions !== undefined) {
        languages[language].extensions.forEach(function (extension) {
            if (extensions[extension] === undefined) {
                extensions[extension] = [language];
            } else {
                extensions[extension].push(language);
            }
        })
    }
    colors[language] = languages[language].color;
});


function getColor(language) {
    return colors[language];
}


function getLanguages(extension) {
    return extensions[extension];
}


module.exports = {
    languages: getLanguages,
    color: getColor
};
