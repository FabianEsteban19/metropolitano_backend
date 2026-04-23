import { Reportes } from "src/reportes/entities/Reportes";
import { RutaEstaciones } from "src/ruta_estaciones/entities/RutaEstaciones";
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("estaciones_pkey", ["id"], { unique: true })
@Entity("estaciones", { schema: "public" })
export class Estaciones {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id!: string;

  @Column("character varying", { name: "nombre", length: 100 })
  nombre!: string;

  @Column("character varying", { name: "distrito", length: 50 })
  distrito!: string;

  @Column("numeric", { name: "latitud", precision: 10, scale: 7 })
  latitud!: string;

  @Column("numeric", { name: "longitud", precision: 10, scale: 7 })
  longitud!: string;

  @Column("integer", { name: "orden" })
  orden!: number;

  @OneToMany(() => Reportes, (reportes) => reportes.estacion)
  reportes!: Reportes[];

  @OneToMany(() => RutaEstaciones, (rutaEstaciones) => rutaEstaciones.estacion)
  rutaEstaciones!: RutaEstaciones[];
}
