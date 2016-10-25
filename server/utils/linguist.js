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


/**
 * Get the color associated with the given language
 *
 * @param language for which to get the color
 * @returns {String}
 */
function getColor(language) {
    return colors[language];
}


/**
 * Get the languages associated with the given extension
 *
 * @param extension for which to get the language
 * @returns {String[]}
 */
function getLanguages(extension) {
    return extensions[extension];
}


module.exports = {
    languages: getLanguages,
    color: getColor
};
