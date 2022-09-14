class Http_error extends Error{
    constructor(message , error_code){
        super(message);
        this.code = error_code;
    }
}

module.exports = Http_error;