import { Estaciones } from "src/estaciones/entities/Estaciones";
import { Rutas } from "src/rutas/entities/Rutas";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";


@Index("ruta_estaciones_pkey", ["estacionId", "rutaId"], { unique: true })
@Entity("ruta_estaciones", { schema: "public" })
export class RutaEstaciones {
  @Column("bigint", { primary: true, name: "ruta_id" })
  rutaId!: string;

  @Column("bigint", { primary: true, name: "estacion_id" })
  estacionId!: string;

  @Column("integer", { name: "orden" })
  orden!: number;

  @ManyToOne(() => Estaciones, (estaciones) => estaciones.rutaEstaciones, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "estacion_id", referencedColumnName: "id" }])
  estacion: Estaciones = new Estaciones;

  @ManyToOne(() => Rutas, (rutas) => rutas.rutaEstaciones, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ruta_id", referencedColumnName: "id" }])
  ruta: Rutas = new Rutas;
}
