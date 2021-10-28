class RowDoesNotExistError extends Error {
    constructor(msg: string){
        super(msg);
        this.name= 'RowDoesNotExist';
    }
}

class InvalidCredentialsError extends Error {
    constructor(msg: string){
        super(msg);
        this.name = 'InvalidCredentials';
    }
}

export { RowDoesNotExistError, InvalidCredentialsError };