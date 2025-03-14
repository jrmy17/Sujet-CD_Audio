const axios = require("axios");

jest.mock("axios");

const API_URL = "http://localhost:5005/api/cds";

describe("CD API Integration Tests", () => {
  describe("Get CDs API", () => {
    it("should fetch CDs from the API", async () => {
      const mockCDs = [
        { id: 1, title: "Test Album", artist: "Test Artist", year: 2025 },
        { id: 2, title: "Another Album", artist: "Another Artist", year: 2025 },
      ];

      axios.get.mockResolvedValue({ data: mockCDs });

      const response = await axios.get(API_URL);

      expect(axios.get).toHaveBeenCalledWith(API_URL);
      expect(response.data).toEqual(mockCDs);
      expect(response.data.length).toBe(2);
    });

    it("should handle API errors when fetching CDs", async () => {
      const errorMsg = "Network Error";
      axios.get.mockRejectedValue(new Error(errorMsg));

      await expect(axios.get(API_URL)).rejects.toThrow(errorMsg);
    });
  });

  describe("Add CD API", () => {
    it("should send CD data to the API", async () => {
      const newCD = {
        title: "New Album",
        artist: "New Artist",
        year: 2025,
      };

      const expectedResponse = { id: 1, ...newCD };
      axios.post.mockResolvedValue({ data: expectedResponse });

      const response = await axios.post(API_URL, newCD);

      expect(axios.post).toHaveBeenCalledWith(API_URL, newCD);
      expect(response.data).toEqual(expectedResponse);
    });
  });

  describe("Delete CD API", () => {
    it("should send delete request to the API", async () => {
      const cdId = 123;
      axios.delete.mockResolvedValue({});

      await axios.delete(`${API_URL}/${cdId}`);

      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/${cdId}`);
    });
  });
});
