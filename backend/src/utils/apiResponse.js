/**
 * Unified API Response Helper.
 * Preserves the exact response formats to avoid breaking the frontend.
 */
export class ApiResponse {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json(data);
  }

  static created(res, data) {
    return res.status(201).json(data);
  }

  static deleted(res) {
    return res.status(200).json({ success: true });
  }

  static ok(res) {
    return res.status(200).json({ success: true });
  }
}
