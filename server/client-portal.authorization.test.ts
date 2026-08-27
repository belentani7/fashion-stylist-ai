import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function clientContext(): TrpcContext {
  return {
    user: {
      id: 77,
      openId: "client-portal-test",
      email: "client@example.com",
      name: "Client Portal Test",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("autorización de Studio profesional", () => {
  it("rechaza una cuenta cliente antes de consultar clientas o looks del back-office", async () => {
    const caller = appRouter.createCaller(clientContext());
    await expect(caller.clients.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.outfits.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.stylist.propose({ clientId: 1, language: "pt-BR" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
