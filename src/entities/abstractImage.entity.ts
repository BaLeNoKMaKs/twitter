import {
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractImageEntity extends BaseEntity {
   @PrimaryGeneratedColumn()
   id: number;

    @Column('varchar')
    key: string;

    @Column('varchar')
    url: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;
}