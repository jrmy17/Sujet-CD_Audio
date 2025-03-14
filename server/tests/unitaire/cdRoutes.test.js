const express = require("express");
const request = require("supertest");
const cdRoutes = require("../../Routes/cdRoutes");
const cdController = require("../../Controllers/cdController");

jest.mock("../../Controllers/cdController", () => ({
  getAllCDs: jest.fn((req, res) => res.json({ message: "getAllCDs called" })),
  addCD: jest.fn((req, res) =>
    res.status(201).json({ message: "addCD called" })
  ),
  deleteCD: jest.fn((req, res) => res.status(204).send()),
}));

const app = express();
app.use(express.json());
app.use("/api", cdRoutes);

describe("CD Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/cds", () => {
    it("should call getAllCDs controller", async () => {
      const response = await request(app).get("/api/cds");

      expect(response.status).toBe(200);
      expect(cdController.getAllCDs).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "getAllCDs called" });
    });
  });

  describe("POST /api/cds", () => {
    it("should call addCD controller", async () => {
      const newCD = { title: "Test CD", artist: "Test Artist", year: 2025 };

      const response = await request(app).post("/api/cds").send(newCD);

      expect(response.status).toBe(201);
      expect(cdController.addCD).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "addCD called" });
    });
  });

  describe("DELETE /api/cds/:id", () => {
    it("should call deleteCD controller", async () => {
      const response = await request(app).delete("/api/cds/1");

      expect(response.status).toBe(204);
      expect(cdController.deleteCD).toHaveBeenCalled();
    });
  });
});
