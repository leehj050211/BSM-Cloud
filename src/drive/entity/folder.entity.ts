import { Entity, Column } from 'typeorm';

@Entity()
export class Folder {
    @Column({
        type: 'binary',
        length: 16,
        primary: true,
        nullable: false
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
    folderName: string;

    @Column({nullable: false})
    created: Date;

    @Column({nullable: false})
    isShare: boolean;

    @Column({nullable:true})
    parentId: Buffer;
}