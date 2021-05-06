function getPubString(pub) {
    var pubString = '';
    for(var key in pub) {
        var fields = ["type", "paperTitle", 
            "JCTitle", "year", "authors", "fullAuthors"];
        if (fields.includes(key)) {
            if(pub.hasOwnProperty(key) && pub[key] !== '') 
                pubString += pub[key].toString().toLowerCase().trim() + ' ';
        }
    }
    return pubString;
}

var runSearch = function(searchValue, publist) {
    // Get the search terms from the input field
    if (searchValue == '') 
        return []
    var searchTerm = searchValue;
    // Tokenize the search terms and remove empty spaces
    var tokens = searchTerm
                  .toLowerCase()
                  .split(' ')
                  .filter(function(token){
                    return token.trim() !== '';
                  });
   if (tokens.length) {
        //  Create a regular expression of all the search terms
        var searchTermRegex = new RegExp(tokens.join('|'), 'gim');
        var filteredList = publist.filter(function(pub) {
        // Create a string of all object values
        var pubString = getPubString(pub);
        // Return pub objects where a match with the search regex if found
        return pubString.match(searchTermRegex);
    });
    // return search results
    return filteredList;
   }
   return []
};

module.exports = runSearch;
