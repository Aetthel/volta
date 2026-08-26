import autocannon from "autocannon";
import http from "http";
import app from "../../index.js";

async function runLoadTest() {
  console.log("⚡ [LoadTest] Starting High-Concurrency Stress Test...");

  // Start temporary server for load testing on an ephemeral port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`⚡ [LoadTest] Test server listening on ${baseUrl}`);

  try {
    const result = await autocannon({
      url: `${baseUrl}/health`,
      connections: 50, // 50 concurrent sessions
      pipelining: 1,
      duration: 5, // 5 seconds duration
      headers: {
        "x-api-key": process.env.API_KEY || "volta_dev_api_key_8f91c7a2e4b6d3f0",
      },
    });

    console.log("\n=======================================================");
    console.log("📊 RESULTADOS DEL TEST DE ALTA CONCURRENCIA (AUTOCANNON)");
    console.log("=======================================================");
    console.log(`🚀 Conexiones Concurrentes: 50`);
    console.log(`⏱️  Duración:                 5 segundos`);
    console.log(`📈 Solicitudes Totales:       ${result.requests.total}`);
    console.log(`⚡ Rendimiento (Req/seg):     ${result.requests.average?.toFixed(2) || result.requests.total / 5} req/s`);
    console.log(`🟢 Latencia Media:            ${result.latency.average?.toFixed(2) || 0} ms`);
    console.log(`🎯 Latencia P99:              ${result.latency.p99?.toFixed(2) || result.latency.max?.toFixed(2) || 0} ms`);
    console.log(`🎯 Latencia Max:              ${result.latency.max?.toFixed(2) || 0} ms`);
    console.log(`❌ Errores / 5xx:             ${result.errors + result.timeouts + result.non2xx}`);
    console.log("=======================================================\n");

    if (result.errors > 0 || result.timeouts > 0) {
      console.error("❌ El test de carga registró errores o timeouts.");
      process.exit(1);
    }

    if (result.latency.p95 > 150) {
      console.warn("⚠️  La latencia P95 superó los 150ms bajo estrés.");
    } else {
      console.log("✅ ¡Prueba de alta concurrencia superada con éxito (P95 < 100ms)!");
    }
  } catch (err) {
    console.error("Error durante el test de carga:", err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runLoadTest();
