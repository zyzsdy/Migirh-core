import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export default class Category {
    @PrimaryColumn()
    cate_id: string

    @Column({nullable: true})
    cate_name: string

    @Column("text", {nullable: true})
    default_path: string
}