import { jest } from "@jest/globals";
import { ApiResponse } from "../utils/apiResponse.js";

describe("ApiResponse", () => {
  let res;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should return success with default 200", () => {
    ApiResponse.success(res, { data: "test" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: "test" });
  });

  it("should return success with custom status", () => {
    ApiResponse.success(res, { data: "test" }, 201);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return created with 201", () => {
    ApiResponse.created(res, { id: "1" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "1" });
  });

  it("should return deleted with success", () => {
    ApiResponse.deleted(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should return ok with success", () => {
    ApiResponse.ok(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});
