import { EntityRepository, Repository } from "typeorm";
import { Drive } from "../entity/drive.entity";

import { v4 as getUuid } from 'uuid';
import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";

@EntityRepository(Drive)
export class DriveRepository extends Repository<Drive> {

    async createDrive(usercode: number): Promise<Drive> {
        const uuid = getUuid()
        const drive = this.create({
            id: new Buffer(uuid.replaceAll('-', ''), 'hex'),
            usercode: usercode
        });

        try{
            return await this.save(drive)
        }catch(error){
            if(error.sqlState === '23000'){
                throw new ConflictException('Existing drive');
            }else{
                console.error(error)
                throw new InternalServerErrorException();
            }
        }
    }

    async getDriveByUsercode(usercode: number): Promise<Drive> {
        const driveId = this.findOne({
            usercode: usercode
        });
        return driveId;
    }
}