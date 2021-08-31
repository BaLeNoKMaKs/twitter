import { AbstractImageEntity } from "./abstractImage.entity";
import { Entity } from 'typeorm';

@Entity()
export class Avatar extends AbstractImageEntity {}