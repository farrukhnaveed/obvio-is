class Response {
    constructor (res=null) {
        this.res = res;
        this.status = false;
        this.statusCode = null;
        this.message = '';
        this.error = null;
        this.result = null;
    }

    setRes = res => {
        this.res = res;
        return this;
    }

    setStatus = status => {
        this.status = status;
        return this;
    }

    setStatusCode = statusCode => {
        this.statusCode = statusCode;
        return this;
    }

    setMessage = message => {
        this.message = message;
        return this;
    }

    setError = error => {
        this.error = error;
        return this;
    }

    setResult = result => {
        this.result = result;
        return this;
    }

    fromJSON = (obj) => {
        this.status = obj.status ? obj.status : this.status;
        this.statusCode = obj.statusCode ? obj.statusCode : this.statusCode;
        this.message = obj.message ? obj.message : this.message;
        this.error = obj.error ? obj.error : this.error;
        this.result = obj.result ? obj.result : this.result;
        return this;
    }

    toJSON = () => {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            error: this.error,
            result: this.result
        };
    }

    send = () => {

        if (this.res) {
            let resp = {
                status: this.status,
                message: this.message,
                error: this.error,
                result: this.result
            };
    
            if (this.statusCode) {
                this.res.status(this.statusCode).send(resp);
            } else {
                this.res.send(resp);
            }
        }

        return this;
    }
}

module.exports = Response;
