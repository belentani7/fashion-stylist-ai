import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");

describe("frontera de propuestas para clientas", () => {
  it("reserva la invitación y aprobación a Natalia y limita el portal a looks ready", () => {
    expect(routerSource).toContain("clientSharing: router");
    expect(routerSource).toContain("grant: adminProcedure");
    expect(routerSource).toContain("setClientVisibility: adminProcedure");
    expect(routerSource).toContain("clients: router({\n    list: adminProcedure");
    expect(routerSource).toContain("contexts: router({\n    list: adminProcedure");
    expect(routerSource).toContain("outfits: router({\n    list: adminProcedure");
    expect(routerSource).toContain("references: router({\n    list: adminProcedure");
    expect(routerSource).toContain("propose: adminProcedure");
    expect(routerSource).toContain("clientPortal: router");
    expect(dbSource).toContain('eq(outfits.status, "ready")');
    expect(dbSource).toContain("getClientPortalAccessForViewer");
  });
});
