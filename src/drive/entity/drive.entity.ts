import { Entity, Column, Index } from 'typeorm';

@Entity()
@Index(['id', 'userCode'])
export class Drive {
    @Column({
        type: 'binary',
        length: 16,
        primary: true,
        nullable: false
    })
    id: BinaryData;

    @Column({nullable: false})
    userCode: number;
}