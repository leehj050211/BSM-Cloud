import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/user/entity/user.entity';

@Entity('token')
export class TokenEntity {

    @PrimaryColumn({
        length: 128
    })
    token: string;

    @Column({
        default: true
    })
    valid: boolean;

    @ManyToOne(type => UserEntity, user => user.code)
    @JoinColumn({name: 'userCode'})
    user: UserEntity;

    @Column({nullable: false, unsigned: true})
    userCode: number;

    @Column({nullable: false})
    createdAt: Date;
}
