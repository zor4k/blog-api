class RowDoesNotExistError extends Error {
    constructor(msg: string){
        super(msg);
        this.name= 'RowDoesNotExist';
    }
}

export { RowDoesNotExistError };