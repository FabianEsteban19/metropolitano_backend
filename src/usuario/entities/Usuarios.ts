import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("usuarios_email_key", ["email"], { unique: true })
@Index("usuarios_pkey", ["id"], { unique: true })
@Entity("usuarios", { schema: "public" })
export class Usuarios {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column("character varying", { name: "email", unique: true, length: 120 })
  email!: string;

  @Column("text", { name: "password_hash" })
  passwordHash!: string;

  @Column("character varying", { name: "nombre", nullable: true, length: 100 })
  nombre!: string | null;

  @Column("enum", {
    name: "rol",
    enum: ["admin", "operador", "supervisor"],
    default: () => "'operador'",
  })
  rol!: "admin" | "operador" | "supervisor";

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt!: Date;
}
