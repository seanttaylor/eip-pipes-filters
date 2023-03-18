//@ts-nocheck See issue https://github.com/tryredeem/redeem-hub/issues/221

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const APP_NAME = "eip-pipes-filters";
const APP_VERSION = "0.0.1";
const SERVER_OPTIONS = { port: 3000 };

console.log(`${APP_NAME} v${APP_VERSION}`);

serve((req) => {
  return new Response(
    JSON.stringify({ name: `${APP_NAME}`, version: `${APP_VERSION}` }),
    { headers: { "content-type": "application/json" } },
  );
}, SERVER_OPTIONS);
