import { Entity, Column } from 'typeorm';

@Entity()
export class File {
    @Column({
        type: 'binary',
        length: 16,
        primary: true,
        nullable: false
    })
    fileId: Buffer;

    @Column({
        type: 'binary',
        length: 16,
        nullable: false
    })
    driveId: Buffer;

    @Column({unsigned: true, nullable: false})
    usercode: number;

    @Column({length: 64, nullable: false})
    originalName: string;

    @Column({
        type: 'binary',
        length: 16,
        nullable: false
    })
    fileName: Buffer;

    @Column({nullable: false})
    created: Date;
}