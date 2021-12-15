import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export default class Task {
    @PrimaryColumn()
    task_id: string

    /**
     * 0-Default 1-Downloading 2-Paused 3-Merging 4-Completed 5-Error
     */
    @Column("int")
    status: number

    /**
     * 0-ArchiveDownload 1-LiveDownload
     */
    @Column("int")
    is_live: number

    @Column()
    filename: string

    @Column()
    output_path: string

    @Column()
    source_url: string

    @Column()
    category: string

    @Column()
    date_create: Date

    @Column()
    date_update: Date

    @Column("text", {nullable: true})
    download_options: string

    @Column("text", {nullable: true})
    description: string
}