const request = require("supertest");
const express = require("express");
const { GenericContainer, Wait } = require("testcontainers");
const { Pool } = require("pg");
const fs = require("fs").promises;
const path = require("path");

jest.mock("../../configs/db");

const cdRoutes = require("../../Routes/cdRoutes");

describe("CD API - Database Integration", () => {
  let container;
  let app;
  let pool;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:14")
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: "testuser",
        POSTGRES_PASSWORD: "testpassword",
        POSTGRES_DB: "testdb",
      })
      .withWaitStrategy(
        Wait.forLogMessage("database system is ready to accept connections")
      )
      .start();

    const connectionConfig = {
      user: "testuser",
      password: "testpassword",
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: "testdb",
    };

    pool = new Pool(connectionConfig);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const sqlScript = await fs.readFile(
      path.join(__dirname, "../../configs/import.sql"),
      "utf8"
    );
    await pool.query(sqlScript);

    const dbModule = require("../../configs/db");
    dbModule.query = pool.query.bind(pool);

    app = express();
    app.use(express.json());
    app.use("/api", cdRoutes);
  }, 60000);

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
    if (container) {
      await container.stop();
    }
    jest.resetModules();
  });

  beforeEach(async () => {
    if (pool) {
      await pool.query("DELETE FROM cds");
    }
  });

  it("should insert a CD into the database and retrieve it", async () => {
    const newCD = {
      title: "Integration Test Album",
      artist: "Test Artist",
      year: 2025,
    };

    const createResponse = await request(app).post("/api/cds").send(newCD);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty("id");
    expect(createResponse.body.title).toBe(newCD.title);
    expect(createResponse.body.artist).toBe(newCD.artist);
    expect(createResponse.body.year).toBe(newCD.year);

    const getResponse = await request(app).get("/api/cds");

    expect(getResponse.status).toBe(200);
    expect(Array.isArray(getResponse.body)).toBeTruthy();
    expect(getResponse.body.length).toBe(1);
    expect(getResponse.body[0].title).toBe(newCD.title);

    const dbResult = await pool.query("SELECT * FROM cds");
    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].title).toBe(newCD.title);
  });

  it("should delete a CD from the database", async () => {
    const result = await pool.query(
      "INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3) RETURNING *",
      ["Delete Test", "Delete Artist", 2025]
    );
    const testCD = result.rows[0];

    const deleteResponse = await request(app).delete(`/api/cds/${testCD.id}`);
    expect(deleteResponse.status).toBe(204);

    const dbResult = await pool.query("SELECT * FROM cds WHERE id = $1", [
      testCD.id,
    ]);
    expect(dbResult.rows.length).toBe(0);
  });

  it("should fetch all CDs from the database", async () => {
    await pool.query(
      "INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3), ($4, $5, $6)",
      ["Album 1", "Artist 1", 2025, "Album 2", "Artist 2", 2025]
    );

    const getResponse = await request(app).get("/api/cds");

    expect(getResponse.status).toBe(200);
    expect(Array.isArray(getResponse.body)).toBeTruthy();
    expect(getResponse.body.length).toBe(2);

    const titles = getResponse.body.map((cd) => cd.title).sort();
    expect(titles).toEqual(["Album 1", "Album 2"]);
  });
});
