function toLower( val ){
    // Takes in a string and returns a lower case version with
    // spaces replaced with hyphens 
    //
    val = (''+val).toLowerCase().trim().replace(/ /g, '-');
    return val;
}

module.exports = toLower;
