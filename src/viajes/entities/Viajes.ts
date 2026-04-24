import { Buses } from "src/buses/entities/Buses";
import { Rutas } from "src/rutas/entities/Rutas";
import { ViajeEstaciones } from "src/viaje_estaciones/entities/ViajeEstaciones";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("idx_viajes_ruta_fecha", ["rutaId", "fechaOperacion"], {})
@Index("idx_viajes_bus_fecha", ["busId", "fechaOperacion"], {})
@Index("idx_viajes_estado", ["estado"], {})
@Index("idx_viajes_active", ["isActive"], {})
@Index("viajes_pkey", ["id"], { unique: true })
@Entity("viajes", { schema: "public" })
export class Viajes {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column("uuid", { name: "ruta_id" })
  rutaId!: string;

  @Column("uuid", { name: "bus_id" })
  busId!: string;

  @Column("date", { name: "fecha_operacion" })
  fechaOperacion!: string;

  @Column("timestamp with time zone", { name: "hora_salida_programada" })
  horaSalidaProgramada!: Date;

  @Column("timestamp with time zone", {
    name: "hora_salida_real",
    nullable: true,
  })
  horaSalidaReal!: Date | null;

  @Column("timestamp with time zone", {
    name: "hora_llegada_programada",
    nullable: true,
  })
  horaLlegadaProgramada!: Date | null;

  @Column("timestamp with time zone", {
    name: "hora_llegada_real",
    nullable: true,
  })
  horaLlegadaReal!: Date | null;

  @Column("enum", {
    name: "estado",
    enum: [
      "programado",
      "en_recorrido",
      "completado",
      "cancelado",
      "retrasado",
    ],
    default: () => "'programado'",
  })
  estado!:
    | "programado"
    | "en_recorrido"
    | "completado"
    | "cancelado"
    | "retrasado";

  @Column("enum", {
    name: "sentido",
    enum: ["ida", "vuelta"],
    default: () => "'ida'",
  })
  sentido!: "ida" | "vuelta";

  @Column("text", { name: "observaciones", nullable: true })
  observaciones!: string | null;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive!: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt!: Date;

  @ManyToOne(() => Rutas, (rutas) => rutas.viajes, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "ruta_id", referencedColumnName: "id" }])
  ruta!: Rutas;

  @ManyToOne(() => Buses, (buses) => buses.viajes, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "bus_id", referencedColumnName: "id" }])
  bus!: Buses;

  @OneToMany(() => ViajeEstaciones, (viajeEstaciones) => viajeEstaciones.viaje)
  viajeEstaciones!: ViajeEstaciones[];
}
