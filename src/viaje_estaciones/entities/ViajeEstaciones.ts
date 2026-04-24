import { Estaciones } from "src/estaciones/entities/Estaciones";
import { Viajes } from "src/viajes/entities/Viajes";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("idx_viaje_estaciones_viaje_orden", ["viajeId", "orden"], {
  unique: true,
})
@Index("idx_viaje_estaciones_estacion", ["estacionId"], {})
@Index("idx_viaje_estaciones_active", ["isActive"], {})
@Index("viaje_estaciones_pkey", ["id"], { unique: true })
@Entity("viaje_estaciones", { schema: "public" })
export class ViajeEstaciones {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column("uuid", { name: "viaje_id" })
  viajeId!: string;

  @Column("uuid", { name: "estacion_id" })
  estacionId!: string;

  @Column("integer", { name: "orden" })
  orden!: number;

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

  @Column("timestamp with time zone", {
    name: "hora_salida_programada",
    nullable: true,
  })
  horaSalidaProgramada!: Date | null;

  @Column("timestamp with time zone", {
    name: "hora_salida_real",
    nullable: true,
  })
  horaSalidaReal!: Date | null;

  @Column("enum", {
    name: "estado_cumplimiento",
    enum: ["pendiente", "a_tiempo", "tarde", "omitida"],
    default: () => "'pendiente'",
  })
  estadoCumplimiento!: "pendiente" | "a_tiempo" | "tarde" | "omitida";

  @Column("text", { name: "observaciones", nullable: true })
  observaciones!: string | null;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive!: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt!: Date;

  @ManyToOne(() => Viajes, (viajes) => viajes.viajeEstaciones, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "viaje_id", referencedColumnName: "id" }])
  viaje!: Viajes;

  @ManyToOne(() => Estaciones, (estaciones) => estaciones.viajeEstaciones, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "estacion_id", referencedColumnName: "id" }])
  estacion!: Estaciones;
}
