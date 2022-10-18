import { Entity, Column } from 'typeorm';

@Entity()
export class ShareCode {
    @Column({
        length: 4,
        primary: true,
        nullable: false
    })
    code: string;

    @Column({
        type: 'binary',
        length: 16,
        primary: true,
        nullable: false
    })
    fileId: Buffer;

    @Column({nullable: false})
    expire: Date;
}