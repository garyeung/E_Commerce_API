import { EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { DBConnection } from "../../config/db.config";

async function getRepo<T extends ObjectLiteral>(entity: EntityTarget<T>): Promise<Repository<T>> {
   return (await DBConnection()).getRepository(entity); 
}

export default getRepo;


