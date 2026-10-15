import "server-only";
import os from "os";

export function lanHosts() {
  const hosts: string[] = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list ?? []) {
      if (net.family === "IPv4" && !net.internal) hosts.push(net.address);
    }
  }
  return hosts;
}
