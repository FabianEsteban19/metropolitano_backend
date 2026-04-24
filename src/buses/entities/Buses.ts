import { Reportes } from "src/reportes/entities/Reportes";
import { Rutas } from "src/rutas/entities/Rutas";
import { Viajes } from "src/viajes/entities/Viajes";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("buses_codigo_key", ["codigo"], { unique: true })
@Index("idx_buses_estado", ["estado"], {})
@Index("buses_pkey", ["id"], { unique: true })
@Index("buses_placa_key", ["placa"], { unique: true })
@Index("idx_buses_ruta", ["rutaId"], {})
@Entity("buses", { schema: "public" })
export class Buses {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column("character varying", { name: "codigo", unique: true, length: 20 })
  codigo!: string;

  @Column("integer", { name: "capacidad" })
  capacidad!: number;

  @Column("character varying", {
    name: "placa",
    nullable: true,
    unique: true,
    length: 10,
  })
  placa!: string | null;

  @Column("uuid", { name: "ruta_id", nullable: true })
  rutaId!: string | null;

  @Column("enum", {
    name: "estado",
    enum: ["en_ruta", "en_estacion", "fuera_servicio", "retraso"],
    default: () => "'fuera_servicio'",
  })
  estado!: "en_ruta" | "en_estacion" | "fuera_servicio" | "retraso";

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt!: Date;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive!: boolean;

  @ManyToOne(() => Rutas, (rutas) => rutas.buses, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "ruta_id", referencedColumnName: "id" }])
  ruta!: Rutas;
  
  @OneToMany(() => Reportes, (reportes) => reportes.bus)
  reportes!: Reportes[];

  @OneToMany(() => Viajes, (viajes) => viajes.bus)
  viajes!: Viajes[];
}
