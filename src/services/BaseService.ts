import { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";

abstract class BaseService<T extends ObjectLiteral> {
    protected Repository: Repository<T>;

    constructor(repository: Repository<T>) {
        this.Repository = repository;
    }

    protected async handleDBOperation<S>(action:string, operation: () => Promise<S>):Promise<S>{
       try {
        return await operation();
        
       } catch (error) {

              throw new Error(`Error ${action} in database: ${error}`); 

       } 
    }
   
    public async findOne(options: FindOptionsWhere<T>){
        return this.handleDBOperation(
            'finding one',
            async () => {
                return this.Repository.findOne({where:options})
            }
        )
    }

    public async findAll(options: FindOptionsWhere<T>){
        return this.handleDBOperation(
            'finding all',
            async () => {
                return this.Repository.find({where:options})
            }
        )
    }

    public async create(data: DeepPartial<T>){
        return this.handleDBOperation(
            'creating',
            async () => {
                const newEntity = this.Repository.create(data);
                return this.Repository.save(newEntity);
            }
        )
    }


    public async delete(options: FindOptionsWhere<T>){
        return this.handleDBOperation(
           'deleting',
           async () => {
                const result = await this.Repository.delete(options);
                return result.affected? true: false
           }
        )
    }


}
export default BaseService;