-- CreateTable
CREATE TABLE "LembreteEnviado" (
    "id" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "LembreteEnviado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LembreteEnviado_usuarioId_dia_key" ON "LembreteEnviado"("usuarioId", "dia");

-- AddForeignKey
ALTER TABLE "LembreteEnviado" ADD CONSTRAINT "LembreteEnviado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
