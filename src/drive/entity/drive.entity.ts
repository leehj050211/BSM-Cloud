import { Entity, Column, Unique } from 'typeorm';

@Entity()
@Unique(['usercode'])
export class Drive {
    @Column({
        type: 'binary',
        length: 16,
        primary: true,
        nullable: false
    })
    id: Buffer;

    @Column({nullable: false})
    usercode: number;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: false
    })
    total: number;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: false
    })
    used: number;
}