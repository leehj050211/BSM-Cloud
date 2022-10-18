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
        nullable: true
    })
    folderId: Buffer;

    @Column({
        type: 'binary',
        length: 16,
        nullable: false
    })
    driveId: Buffer;

    @Column({
        unsigned: true,
        nullable: false
    })
    userCode: number;

    @Column({
        length: 255,
        nullable: false
    })
    originalName: string;

    @Column({
        type: 'binary',
        length: 16,
        nullable: false
    })
    fileName: Buffer;

    @Column({
        nullable: false
    })
    created: Date;

    @Column({
        type: 'int',
        unsigned: true,
        nullable: false
    })
    size: number;

    @Column({
        nullable: false
    })
    isShare: boolean;
}