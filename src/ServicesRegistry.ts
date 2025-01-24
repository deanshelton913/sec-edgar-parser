/**
 * This file is responsible for dynamically loading and registering service classes
 * from the "services" directory into the dependency injection container provided by
 * the "tsyringe" library. It reads all TypeScript files in the "services" directory,
 * excluding test files, and registers each service class with the container, allowing
 * them to be resolved and injected wherever needed in the application.
 */
import "reflect-metadata";
import { container } from "tsyringe";

import { readdirSync } from "node:fs";
import { join } from "node:path";

const serviceFiles = readdirSync(join(__dirname, "services"))
  .filter((file) => !file.endsWith(".test.ts"))
  .map((file) => file.replace(".ts", ""));

for (const service of serviceFiles) {
  const serviceClass = require(`./services/${service}`)[service];
  container.register(service, {
    useClass: serviceClass,
  });
}
