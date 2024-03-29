import { EntityRepository, Repository } from "typeorm";
import { Drive } from "../entity/drive.entity";

import { v4 as getUuid } from 'uuid';
import { ConflictException, InternalServerErrorException } from "@nestjs/common";

@EntityRepository(Drive)
export class DriveRepository extends Repository<Drive> {

    async createDrive(userCode: number, total: number): Promise<Drive> {
        const uuid = getUuid().replaceAll('-', '')
        const drive = this.create({
            id: new Buffer(uuid, 'hex'),
            userCode,
            total,
            used: 0
        });

        try{
            return await this.save(drive)
        }catch(error){
            if(error.sqlState === '23000'){
                throw new ConflictException('Drive already exists');
            }else{
                console.error(error)
                throw new InternalServerErrorException();
            }
        }
    }

    async getDriveByUsercode(userCode: number): Promise<Drive> {
        const driveId = this.findOne({
            userCode
        });
        return driveId;
    }

    async updateTotalUsed(driveId: string, used: number): Promise<void> {
        try{
            this.update({
                id: new Buffer(driveId, 'hex')
            }, {
                used
            })
        }catch(error){
            console.error(error)
            throw new InternalServerErrorException();
        }
    }
}