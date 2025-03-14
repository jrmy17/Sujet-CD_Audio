const cdController = require("../../Controllers/cdController");
const pool = require("../../configs/db");

jest.mock("../../configs/db", () => ({
  query: jest.fn(),
}));

describe("CD Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCDs", () => {
    it("should get all CDs", async () => {
      const mockRequest = {};
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const mockCDs = [
        { id: 1, title: "Test CD 1", artist: "Artist 1", year: 2025 },
        { id: 2, title: "Test CD 2", artist: "Artist 2", year: 2025 },
      ];
      pool.query.mockResolvedValue({ rows: mockCDs });

      await cdController.getAllCDs(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM cds ORDER BY id ASC"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockCDs);
    });

    it("should handle errors when getting CDs", async () => {
      const mockRequest = {};
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await cdController.getAllCDs(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("addCD", () => {
    it("should add a new CD", async () => {
      const mockRequest = {
        body: { title: "New CD", artist: "New Artist", year: 2025 },
      };
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const newCD = { id: 3, ...mockRequest.body };
      pool.query.mockResolvedValue({ rows: [newCD] });

      await cdController.addCD(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3) RETURNING *",
        [mockRequest.body.title, mockRequest.body.artist, mockRequest.body.year]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newCD);
    });

    it("should handle errors when adding a CD", async () => {
      const mockRequest = {
        body: { title: "Error CD", artist: "Error Artist", year: 2025 },
      };
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const error = new Error("Insert error");
      pool.query.mockRejectedValue(error);

      await cdController.addCD(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteCD", () => {
    it("should delete a CD", async () => {
      const mockRequest = {
        params: { id: 1 },
      };
      const mockResponse = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      pool.query.mockResolvedValue({});

      await cdController.deleteCD(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith("DELETE FROM cds WHERE id = $1", [
        mockRequest.params.id,
      ]);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should handle errors when deleting a CD", async () => {
      const mockRequest = {
        params: { id: 999 },
      };
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const error = new Error("Delete error");
      pool.query.mockRejectedValue(error);

      await cdController.deleteCD(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
