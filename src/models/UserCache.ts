import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export default class UserCache {
    @PrimaryColumn()
    username: string

    @PrimaryColumn()
    config_key: string

    @Column("text", {nullable: true})
    config_value: string
}