import { Buses } from "src/buses/entities/Buses";
import { RutaEstaciones } from "src/ruta_estaciones/entities/RutaEstaciones";
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("rutas_codigo_key", ["codigo"], { unique: true })
@Index("rutas_pkey", ["id"], { unique: true })
@Entity("rutas", { schema: "public" })
export class Rutas {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id!: string;

  @Column("character varying", { name: "codigo", unique: true, length: 10 })
  codigo!: string;

  @Column("character varying", { name: "nombre", length: 100 })
  nombre!: string;

  @Column("enum", {
    name: "servicio",
    enum: [
      "Regular",
      "Expreso_1",
      "Expreso_2",
      "Expreso_4",
      "Expreso_5",
      "Expreso_7",
      "SuperExpreso",
      "Alimentador",
    ],
  })
  servicio!: "Regular" |
    "Expreso_1" |
    "Expreso_2" |
    "Expreso_4" |
    "Expreso_5" |
    "Expreso_7" |
    "SuperExpreso" |
    "Alimentador";

  @Column("character varying", { name: "color", length: 7 })
  color!: string;

  @Column("integer", { name: "frecuencia_min", default: () => "5" })
  frecuenciaMin!: number;

  @OneToMany(() => Buses, (buses) => buses.ruta)
  buses!: Buses[];

  @OneToMany(() => RutaEstaciones, (rutaEstaciones) => rutaEstaciones.ruta)
  rutaEstaciones!: RutaEstaciones[];
}
