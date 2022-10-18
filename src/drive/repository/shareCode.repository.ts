import { EntityRepository, MoreThanOrEqual, Repository } from "typeorm";
import { ShareCode } from "../../share/entity/shareCode.entity";

import { v4 as getUuid } from 'uuid';
import { InternalServerErrorException } from "@nestjs/common";

@EntityRepository(ShareCode)
export class ShareRepository extends Repository<ShareCode> {

    async getByFileId(
        fileId: string
    ):Promise<ShareCode> {
        return this.findOne({
            fileId: new Buffer(fileId, 'hex')
        })
    }

    async getByCodeAndTime(
        code: string,
        time: Date
    ):Promise<ShareCode> {
        return this.findOne({
            code,
            expire: MoreThanOrEqual(time)
        })
    }

    async shareFile(
        fileId: string,
        expire: Date
    ):Promise<ShareCode> {
        const code = getUuid().split('-')[1];
        const shareCode = this.create({
            code,
            fileId: new Buffer(fileId, 'hex'),
            expire
        })

        try{
            return await this.save(shareCode)
        }catch(error){
            console.error(error)
            throw new InternalServerErrorException('Failed to share file');
        }
    }
}