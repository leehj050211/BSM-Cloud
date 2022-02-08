import { Entity, Column, Index } from 'typeorm';

@Entity()
export class File {
    @Column({
        type: 'binary',
        length: 16,
        primary: true,
        nullable: false
    })
    fileId: string;

    @Column({
        type: 'binary',
        length: 16,
        nullable: false
    })
    driveId: string;

    @Column({unsigned: true, nullable: false})
    userCode: number;

    @Column({length: 64, nullable: false})
    fileName: string;

    @Column({length: 64, nullable: false})
    originPath: string;

    @Column({nullable: false})
    created: Date;
}