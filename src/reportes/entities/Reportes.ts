import { Buses } from "src/buses/entities/Buses";
import { Estaciones } from "src/estaciones/entities/Estaciones";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("idx_reportes_bus_ts", ["busId", "timestamp"], {})
@Index("reportes_pkey", ["id"], { unique: true })
@Index("idx_reportes_ts", ["timestamp"], {})
@Entity("reportes", { schema: "public" })
export class Reportes {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column("uuid", { name: "bus_id" })
  busId!: string;

  @Column("uuid", { name: "estacion_id", nullable: true })
  estacionId!: string | null;

  @Column("numeric", { name: "latitud", precision: 10, scale: 7 })
  latitud!: string;

  @Column("numeric", { name: "longitud", precision: 10, scale: 7 })
  longitud!: string;

  @Column("integer", { name: "cantidad_pasajeros" })
  cantidadPasajeros!: number;

  @Column("timestamp with time zone", {
    name: "timestamp",
    default: () => "now()",
  })
  timestamp!: Date;

  @Column("numeric", {
    name: "ocupacion_pct",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  ocupacionPct!: string | null;

  @Column("numeric", {
    name: "velocidad_kmh",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  velocidadKmh!: string | null;

  @ManyToOne(() => Buses, (buses) => buses.reportes, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "bus_id", referencedColumnName: "id" }])
  bus: Buses = new Buses;

  @ManyToOne(() => Estaciones, (estaciones) => estaciones.reportes, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "estacion_id", referencedColumnName: "id" }])
  estacion: Estaciones = new Estaciones;
}
